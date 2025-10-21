const mongoose = require('mongoose');
require('dotenv').config();

// Configure MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quizforce');
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process with failure
    }
};

// User schema for authentication
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Initialize the model
const collection = mongoose.model("users", LoginSchema);

// Export the connection function and model
module.exports = collection;
module.exports.connectDB = connectDB;