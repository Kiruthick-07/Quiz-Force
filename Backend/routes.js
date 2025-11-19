const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserModel = require('./Config');
const { Quiz, QuizSubmission } = require('./Config');


router.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        console.log('Signup attempt for:', fullName, email, 'as', role);
        
        
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name: fullName,
            email,
            password: hashedPassword,
            role: role || 'student', // Default to student if role is not provided
        };

        const newUser = await UserModel.create(userData);
        console.log('User created successfully:', fullName);
        
        res.status(201).json({ 
            success: true,
            message: "User created successfully",
            user: { name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === 11000) { // Duplicate email
            res.status(400).json({ success: false, message: "Email already exists" });
        } else {
            res.status(500).json({ success: false, message: "Error creating user" });
        }
    }
});

router.post('/api/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log('Login attempt for email:', email, 'as', role);
        
       
        const query = { email: email };
        if (role) {
            query.role = role; 
        }
        
        const user = await UserModel.findOne(query);
        
        if (!user) {
            console.log('No user found with email:', email, 'and role:', role || 'any');
            return res.status(401).json({ success: false, message: "Invalid credentials or role" });
        }
       
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
            console.log('Login successful for user:', user.name);
            res.status(200).json({ 
                success: true,
                message: "Login successful", 
                user: { 
                    name: user.name, 
                    email: user.email,
                    role: user.role 
                }
            });
        } else {
            console.log('Invalid password for user:', email);
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Quiz routes
router.post('/api/quizzes', async (req, res) => {
    try {
        const { title, description, duration, totalPoints, questions } = req.body;
        
        
        let userId = req.body.userId || "admin";
        
      
        if (userId !== "admin" && !userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user ID provided" });
        }

        // Validate quiz data
        if (!title) {
            return res.status(400).json({ success: false, message: "Quiz title is required" });
        }
        
        if (!questions || questions.length === 0) {
            return res.status(400).json({ success: false, message: "Quiz must have at least one question" });
        }

        // Create new quiz
        const newQuiz = await Quiz.create({
            title,
            description,
            duration,
            totalPoints,
            questions,
            createdBy: userId
        });

        res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            quiz: {
                id: newQuiz._id,
                title: newQuiz.title,
                totalPoints: newQuiz.totalPoints,
                questionCount: newQuiz.questions.length
            }
        });
    } catch (err) {
        console.error('Quiz creation error:', err);
        res.status(500).json({ success: false, message: "Error creating quiz" });
    }
});

// Get all quizzes (potentially filtered by user)
router.get('/api/quizzes', async (req, res) => {
    try {
        const { userId } = req.query;
        
        // If userId is provided, filter by createdBy
        const filter = userId ? { createdBy: userId } : {};
        
        const quizzes = await Quiz.find(filter)
            .select('title description duration totalPoints status questions createdAt')
            .sort({ createdAt: -1 });
        
        // Get participant counts for each quiz
        const quizzesWithParticipants = await Promise.all(
            quizzes.map(async (quiz) => {
                const participantCount = await QuizSubmission.countDocuments({ quizId: quiz._id });
                return {
                    id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    duration: quiz.duration,
                    totalPoints: quiz.totalPoints,
                    status: quiz.status,
                    questionCount: quiz.questions.length,
                    participants: participantCount,
                    createdAt: quiz.createdAt
                };
            })
        );
            
        res.status(200).json({
            success: true,
            quizzes: quizzesWithParticipants
        });
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).json({ success: false, message: "Error fetching quizzes" });
    }
});

// Get a single quiz by ID
router.get('/api/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        res.status(200).json({
            success: true,
            quiz
        });
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).json({ success: false, message: "Error fetching quiz" });
    }
});

// Quiz submission endpoint
router.post('/api/quiz-submissions', async (req, res) => {
    try {
        const { quizId, answers, studentId } = req.body;
        
        if (!quizId || !answers || !studentId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: quizId, answers, studentId" 
            });
        }

        // Fetch the quiz to calculate score
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Calculate score
        let score = 0;
        let totalPoints = 0;
        
        quiz.questions.forEach((question, index) => {
            totalPoints += question.points;
            const userAnswer = answers[index];
            
            // Only auto-grade multiple choice and true/false questions
            if (question.type === 'multiple-choice' || question.type === 'true-false') {
                if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
                    score += question.points;
                }
            }
            // Text questions would need manual grading in a real system
        });

        // Save submission
        const submission = await QuizSubmission.create({
            quizId,
            studentId,
            answers,
            score,
            totalPoints,
            submittedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            score,
            totalPoints,
            submissionId: submission._id
        });

    } catch (err) {
        console.error('Quiz submission error:', err);
        res.status(500).json({ success: false, message: "Error submitting quiz" });
    }
});

// Get quiz submissions for a student
router.get('/api/quiz-submissions', async (req, res) => {
    try {
        const { studentId } = req.query;
        
        if (!studentId) {
            return res.status(400).json({ success: false, message: "studentId is required" });
        }

        const submissions = await QuizSubmission.find({ studentId })
            .populate('quizId', 'title totalPoints')
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            submissions: submissions.map(sub => ({
                id: sub._id,
                quiz: sub.quizId,
                score: sub.score,
                totalPoints: sub.totalPoints,
                submittedAt: sub.submittedAt
            }))
        });

    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ success: false, message: "Error fetching submissions" });
    }
});

// Test route to verify API is working
router.get('/api/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: "API is working correctly" 
    });
});

module.exports = router;