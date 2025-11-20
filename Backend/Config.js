const mongoose = require('mongoose');
require('dotenv').config();

// Configure MongoDB connection
const connectDB = async () => {
    try {
        // Use local MongoDB as primary, with better error handling
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizforce';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            connectTimeoutMS: 10000, // 10 seconds connection timeout
        });
        
        console.log("Connected to MongoDB successfully");
        console.log("Database:", mongoose.connection.name);
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        
        // Fallback to local MongoDB if cloud connection fails
        if (err.message.includes('EREFUSED') || err.message.includes('querySrv')) {
            console.log("Attempting to connect to local MongoDB...");
            try {
                await mongoose.connect('mongodb://localhost:27017/quizforce', {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                });
                console.log("Connected to local MongoDB successfully");
            } catch (localErr) {
                console.error("Local MongoDB connection also failed:", localErr.message);
                console.log("Please ensure MongoDB is installed and running locally");
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
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
            expectedAnswer: String, // For text questions
            validation: {
                caseSensitive: {
                    type: Boolean,
                    default: false
                },
                exactMatch: {
                    type: Boolean,
                    default: false
                }
            },
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

// Enhanced quiz submission schema with detailed analysis
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
    },
    // Enhanced analysis data
    analysis: {
        correctAnswers: {
            type: Number,
            default: 0
        },
        incorrectAnswers: {
            type: Number,
            default: 0
        },
        unansweredQuestions: {
            type: Number,
            default: 0
        },
        accuracy: {
            type: Number,
            default: 0 // Percentage
        },
        completionRate: {
            type: Number,
            default: 0 // Percentage
        },
        performanceLevel: {
            type: String,
            enum: ['Excellent', 'Good', 'Satisfactory', 'Fair', 'Needs Improvement'],
            default: 'Needs Improvement'
        },
        questionAnalysis: [{
            questionIndex: Number,
            questionType: String,
            userAnswer: mongoose.Schema.Types.Mixed,
            correctAnswer: mongoose.Schema.Types.Mixed,
            isCorrect: Boolean,
            points: Number,
            pointsEarned: Number,
            status: {
                type: String,
                enum: ['correct', 'incorrect', 'unanswered', 'pending_review']
            }
        }]
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