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
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    progress: {
        type: [String],   
        default: []
    },
    points: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ["student", "teacher"],
        default: "student"
    }
});

module.exports = mongoose.model("User", userSchema);