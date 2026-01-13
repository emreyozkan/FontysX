const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const session = require("express-session");
const port = 3000;
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

app.get("/", (req, res) => {
    res.render("start");
});

app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/teacher", (req, res) => {
    if (!req.session.user_id || req.session.role !== "teacher") {
        return res.redirect("/");
    }
    res.render("teacher");
});

app.get("/highscore", (req, res) => {
    res.render("highscore");
});

app.get("/code", (req, res) => {
    if (!req.session.user_id || req.session.role !== "teacher") {
        return res.redirect("/");
    }
    res.render("code");
});

app.post("/register", async (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        const role = email.endsWith("@fontys.nl") ? "teacher" : "student";
        const hash = await bcrypt.hash(password, 12);
        const user = new User({
            fullname,
            email,
            password: hash,
            role
        });
        await user.save();

        req.session.user_id = user._id;
        req.session.fullname = user.fullname;
        req.session.role = user.role;
        if (user.role === "teacher") {
            return res.redirect("/teacher");
        }
        res.redirect("/game");
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send("Email already registered");
        }
        res.status(500).send(err.message);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        
        // Check if user exists
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        // Set session data
        req.session.user_id = user._id;
        req.session.fullname = user.fullname;
        req.session.role = user.role;

        // SUCCESS: Tell the JavaScript where to go
        // Instead of redirecting here, we send the URL as data
        const redirectUrl = user.role === "teacher" ? "/teacher" : "/game";
        res.json({ success: true, redirectUrl: redirectUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

app.get("/game", async (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }

    try {
        const user = await User.findById(req.session.user_id);
        if (!user) return res.redirect("/login");

        const currentLevel = (user.progress?.length || 0) + 1;

        // Hide points and progress for teachers
        const displayPoints = user.role === "teacher" ? undefined : user.points || 0;
        const displayProgress = user.role === "teacher" ? undefined : user.progress || [];

        res.render("game", {
            fullname: user.fullname,
            points: displayPoints,
            progress: displayProgress,
            currentLevel
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.post("/api/complete-task", async (req, res) => {
    const { taskId, points } = req.body;

    if (!req.session.user_id) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const user = await User.findById(req.session.user_id);
        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        if (!user.progress.includes(Number(taskId))) {
            user.progress.push(Number(taskId));
            user.points += Number(points || 0);
            user.progress.sort((a, b) => a - b);
            await user.save();
        }

        res.json({ points: user.points, progress: user.progress });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/api/leaderboard", async (req, res) => {
    try {
        // Only include users with role "student"
        const users = await User.find(
            { role: "student" },
            { fullname: 1, points: 1, _id: 0 }
        ).sort({ points: -1 });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Teachers assign a code and level to a student
app.post("/api/apply-code", async (req, res) => {
    const { studentEmail, code, level } = req.body;

    try {
        // Check if teacher is logged in and is a teacher
        if (!req.session.user_id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const teacher = await User.findById(req.session.user_id);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Sanitize code to uppercase alphanumeric only
        const sanitizedCode = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        // Sanitize level to integer
        const sanitizedLevel = parseInt(level, 10);

        if (!sanitizedCode || isNaN(sanitizedLevel)) {
            return res.status(400).json({ success: false, message: "Invalid code or level" });
        }

        // Find the student
        const student = await User.findOne({ email: studentEmail });
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        if (student.currentCode && student.currentCode.level === sanitizedLevel) {
            return res.json({ success: false, message: "Code for this level already assigned" });
        }

        // Assign the sanitized code and level to the student's currentCode
        student.currentCode = { code: sanitizedCode, level: sanitizedLevel };
        await student.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Students submit a code for their current level
app.post("/api/submit-code", async (req, res) => {
    let { submittedCode } = req.body;

    // Check if student is logged in
    if (!req.session.user_id) {
        return res.status(401).json({ success: false, message: "You are not signed in!" });
    }

    try {
        const student = await User.findById(req.session.user_id);
        if (!student || student.role !== "student") {
            return res.status(403).json({ success: false, message: "Unauthorized access!" });
        }

        // Sanitize submittedCode to uppercase alphanumeric only
        submittedCode = String(submittedCode || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

        if (!student.currentCode || !student.currentCode.code || !student.currentCode.level) {
            return res.json({ success: false, message: "No valid code assigned" });
        }

        // Determine current level from progress length
        const sanitizedLevel = (student.progress?.length || 0) + 1;

        if (
            student.currentCode.code !== submittedCode ||
            Number(student.currentCode.level) !== sanitizedLevel
        ) {
            return res.json({ success: false, message: "Invalid code!" });
        }

        // Ensure progress is numeric, single-use, and sorted
        if (!student.progress.includes(sanitizedLevel)) {
            student.progress.push(sanitizedLevel);
            student.points += 10; // Or adjust points as needed
            student.progress = Array.from(new Set(student.progress)).sort((a, b) => a - b);
        }

        // Reset currentCode after use (single-use)
        student.currentCode = undefined;

        // Optional: log submission for debugging
        console.log(`Student ${student.email} submitted code for level ${sanitizedLevel}: ${submittedCode}`);

        await student.save();
        res.json({ success: true, points: student.points, progress: student.progress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})