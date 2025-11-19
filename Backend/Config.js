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
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'active'
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

// Quiz submission schema
const QuizSubmissionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizzes',
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    answers: {
        type: Object, // Store answers as { questionIndex: answer }
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalPoints: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Initialize the models
const UserModel = mongoose.model("users", LoginSchema);
const QuizModel = mongoose.model("quizzes", QuizSchema);
const QuizSubmissionModel = mongoose.model("quiz_submissions", QuizSubmissionSchema);

// Export the connection function and models
module.exports = UserModel;
module.exports.Quiz = QuizModel;
module.exports.QuizSubmission = QuizSubmissionModel;
module.exports.connectDB = connectDB;