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

// Quiz schema for storing quizzes
const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        default: 30 // 30 minutes default
    },
    totalPoints: {
        type: Number,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    questions: [
        {
            type: {
                type: String,
                enum: ['multiple-choice', 'text', 'true-false'],
                required: true
            },
            question: {
                type: String,
                required: true
            },
            options: [String],
            correctAnswer: Number,
            points: {
                type: Number,
                default: 1
            },
            required: {
                type: Boolean,
                default: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Initialize the models
const UserModel = mongoose.model("users", LoginSchema);
const QuizModel = mongoose.model("quizzes", QuizSchema);

// Export the connection function and models
module.exports = UserModel;
module.exports.Quiz = QuizModel;
module.exports.connectDB = connectDB;