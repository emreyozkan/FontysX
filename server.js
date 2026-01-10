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

app.get("/game", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    res.render("game", { fullname: req.session.fullname });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})