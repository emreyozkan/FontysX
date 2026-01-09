const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Full name cannot be blank"]
    },
    email: {
        type: String,
        required: [true, "Email cannot be blank"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password cannot be blank"]
    }
});

module.exports = mongoose.model("User", userSchema)