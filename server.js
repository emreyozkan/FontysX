const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./models/User");
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/game", (req, res) => {
    res.render("game");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})