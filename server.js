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
    res.render("teacher");
});

app.get("/highscore", (req, res) => {
    res.render("highscore");
});

app.get("/code", (req, res) => {
    res.render("code");
});

app.post("/register", async (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        const hash = await bcrypt.hash(password, 12);
        const user = new User({
            fullname,
            email,
            password: hash
        });
        await user.save();

        req.session.user_id = user._id;
        req.session.fullname = user.fullname;
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
        if (!user) {
            return res.status(400).send("Invalid email or password");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid email or password");
        }

        req.session.user_id = user._id;
        req.session.fullname = user.fullname;
        res.redirect("/game");
    } catch (err) {
        res.status(500).send(err.message);
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

        res.render("game", {
            fullname: user.fullname,
            points: user.points || 0,
            progress: user.progress || [],
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

        if (!user.progress.includes(taskId)) {
            user.progress.push(taskId);
            user.points += points;
            await user.save();
        }

        res.json({ points: user.points, progress: user.progress });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})