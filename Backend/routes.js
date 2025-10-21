const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserModel = require('./Config');
const { Quiz } = require('./Config');

// Authentication routes
router.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        console.log('Signup attempt for:', fullName, email, 'as', role);
        
        // Check if user already exists
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
        
        // Find user by email and role
        const query = { email: email };
        if (role) {
            query.role = role; // Only check role if it was provided
        }
        
        const user = await UserModel.findOne(query);
        
        if (!user) {
            console.log('No user found with email:', email, 'and role:', role || 'any');
            return res.status(401).json({ success: false, message: "Invalid credentials or role" });
        }
        
        // Compare password with hashed password
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
        
        // Get user ID from token or session (in a real app)
        // For now, we'll get it from the request body or use a hardcoded value for testing
        let userId = req.body.userId || "admin";
        
        // Always accept our temporary hardcoded userId for testing
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
            .select('title description totalPoints questions createdAt')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            quizzes: quizzes.map(quiz => ({
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                totalPoints: quiz.totalPoints,
                questionCount: quiz.questions.length,
                createdAt: quiz.createdAt
            }))
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

// Test route to verify API is working
router.get('/api/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: "API is working correctly" 
    });
});

module.exports = router;