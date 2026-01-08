const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public"));

app.set("view engine", "ejs");

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