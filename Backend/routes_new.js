const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserModel = require('./Config');
const { Quiz, QuizSubmission } = require('./Config');

// User signup route
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
            role: role || 'student',
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
        if (err.code === 11000) {
            res.status(400).json({ success: false, message: "Email already exists" });
        } else {
            res.status(500).json({ success: false, message: "Error creating user" });
        }
    }
});

// User login route
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

// Enhanced Quiz Creation with Comprehensive Validation
router.post('/api/quizzes', async (req, res) => {
    try {
        const { title, description, duration, totalPoints, questions } = req.body;
        
        // Enhanced validation array
        const validationErrors = [];
        
        // Validate title
        if (!title || !title.trim()) {
            validationErrors.push("Quiz title is required");
        } else if (title.trim().length < 3) {
            validationErrors.push("Quiz title must be at least 3 characters");
        } else if (title.trim().length > 100) {
            validationErrors.push("Quiz title cannot exceed 100 characters");
        }
        
        // Validate description
        if (description && description.length > 500) {
            validationErrors.push("Quiz description cannot exceed 500 characters");
        }
        
        // Validate duration
        if (!duration || duration < 5) {
            validationErrors.push("Quiz duration must be at least 5 minutes");
        } else if (duration > 180) {
            validationErrors.push("Quiz duration cannot exceed 180 minutes (3 hours)");
        }
        
        // Validate questions array
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            validationErrors.push("Quiz must have at least one question");
        } else if (questions.length > 50) {
            validationErrors.push("Quiz cannot have more than 50 questions");
        } else {
            // Detailed question validation
            questions.forEach((question, index) => {
                const qNum = index + 1;
                
                // Validate question text
                if (!question.question || !question.question.trim()) {
                    validationErrors.push(`Question ${qNum}: Question text is required`);
                } else if (question.question.trim().length < 5) {
                    validationErrors.push(`Question ${qNum}: Question text must be at least 5 characters`);
                } else if (question.question.trim().length > 500) {
                    validationErrors.push(`Question ${qNum}: Question text cannot exceed 500 characters`);
                }
                
                // Validate question type
                if (!['multiple-choice', 'true-false', 'text'].includes(question.type)) {
                    validationErrors.push(`Question ${qNum}: Invalid question type`);
                }
                
                // Validate points
                if (!question.points || question.points < 1 || question.points > 10) {
                    validationErrors.push(`Question ${qNum}: Points must be between 1 and 10`);
                }
                
                // Type-specific validation
                if (question.type === 'multiple-choice') {
                    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                        validationErrors.push(`Question ${qNum}: Multiple choice questions must have at least 2 options`);
                    } else if (question.options.length > 6) {
                        validationErrors.push(`Question ${qNum}: Multiple choice questions cannot have more than 6 options`);
                    } else {
                        // Check if all options have content
                        const emptyOptions = question.options.filter(opt => !opt || !opt.trim());
                        if (emptyOptions.length > 0) {
                            validationErrors.push(`Question ${qNum}: All options must have content`);
                        }
                        
                        // Check option lengths
                        question.options.forEach((opt, optIndex) => {
                            if (opt && opt.length > 200) {
                                validationErrors.push(`Question ${qNum}, Option ${optIndex + 1}: Option text cannot exceed 200 characters`);
                            }
                        });
                        
                        // Validate correct answer
                        if (question.correctAnswer === null || question.correctAnswer === undefined || 
                            question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                            validationErrors.push(`Question ${qNum}: Please select a valid correct answer`);
                        }
                    }
                }
                
                if (question.type === 'true-false') {
                    if (question.correctAnswer !== 0 && question.correctAnswer !== 1) {
                        validationErrors.push(`Question ${qNum}: True/False questions must have 0 (False) or 1 (True) as correct answer`);
                    }
                }
                
                if (question.type === 'text') {
                    // Text questions don't need options but might have sample answer
                    if (question.options && question.options.length > 0) {
                        validationErrors.push(`Question ${qNum}: Text questions should not have options`);
                    }
                }
            });
        }
        
        // Validate total points consistency
        if (questions && questions.length > 0) {
            const calculatedTotal = questions.reduce((sum, q) => sum + (q.points || 0), 0);
            if (totalPoints && Math.abs(totalPoints - calculatedTotal) > 0.01) {
                validationErrors.push(`Total points mismatch: Expected ${calculatedTotal}, got ${totalPoints}`);
            }
        }
        
        // Return validation errors if any
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Quiz validation failed", 
                errors: validationErrors 
            });
        }
        
        // Get user ID
        let userId = req.body.userId || "admin";
        
        if (userId !== "admin" && !userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user ID provided" });
        }

        // Create new quiz with cleaned data
        const newQuiz = await Quiz.create({
            title: title.trim(),
            description: description ? description.trim() : '',
            duration,
            totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
            questions: questions.map(q => ({
                type: q.type,
                question: q.question.trim(),
                options: q.options ? q.options.map(opt => opt.trim()).filter(opt => opt) : [],
                correctAnswer: q.correctAnswer,
                points: q.points || 1,
                required: q.required !== false
            })),
            createdBy: userId,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            message: "Quiz created successfully with validation",
            quiz: {
                id: newQuiz._id,
                title: newQuiz.title,
                description: newQuiz.description,
                duration: newQuiz.duration,
                totalPoints: newQuiz.totalPoints,
                questionCount: newQuiz.questions.length,
                status: newQuiz.status,
                createdAt: newQuiz.createdAt
            }
        });
        
    } catch (err) {
        console.error('Quiz creation error:', err);
        res.status(500).json({ 
            success: false, 
            message: "Error creating quiz",
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// Get all quizzes with participant count
router.get('/api/quizzes', async (req, res) => {
    try {
        const { userId } = req.query;
        
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

// Get single quiz by ID
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

// Enhanced Quiz Submission with Detailed Analysis
router.post('/api/quiz-submissions', async (req, res) => {
    try {
        const { quizId, answers, studentId } = req.body;
        
        // Validation
        if (!quizId || !answers || !studentId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: quizId, answers, studentId" 
            });
        }

        // Fetch the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Enhanced scoring with detailed analysis
        let score = 0;
        let totalPoints = 0;
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let unanswered = 0;
        const detailedResults = [];
        
        quiz.questions.forEach((question, index) => {
            totalPoints += question.points;
            const userAnswer = answers[index];
            let isCorrect = false;
            let status = 'unanswered';
            
            if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
                // Auto-grade multiple choice and true/false questions
                if (question.type === 'multiple-choice' || question.type === 'true-false') {
                    if (userAnswer === question.correctAnswer) {
                        score += question.points;
                        correctAnswers++;
                        isCorrect = true;
                        status = 'correct';
                    } else {
                        wrongAnswers++;
                        status = 'incorrect';
                    }
                } else if (question.type === 'text') {
                    // Text questions need manual grading, but we'll mark as answered
                    status = 'needs_review';
                }
            } else {
                unanswered++;
                status = 'unanswered';
            }
            
            // Store detailed result for each question
            detailedResults.push({
                questionIndex: index,
                questionText: question.question,
                questionType: question.type,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                options: question.options,
                points: question.points,
                isCorrect: isCorrect,
                status: status
            });
        });

        // Calculate percentages
        const scorePercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
        const completionRate = quiz.questions.length > 0 ? Math.round(((quiz.questions.length - unanswered) / quiz.questions.length) * 100) : 0;
        
        // Determine performance level
        let performanceLevel = 'Poor';
        if (scorePercentage >= 90) performanceLevel = 'Excellent';
        else if (scorePercentage >= 80) performanceLevel = 'Good';
        else if (scorePercentage >= 70) performanceLevel = 'Average';
        else if (scorePercentage >= 60) performanceLevel = 'Below Average';

        // Save submission with enhanced analysis
        const submission = await QuizSubmission.create({
            quizId,
            studentId,
            answers,
            score,
            totalPoints,
            analysis: {
                correctAnswers,
                wrongAnswers,
                unanswered,
                scorePercentage,
                completionRate,
                performanceLevel,
                detailedResults
            },
            submittedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            score,
            totalPoints,
            scorePercentage,
            analysis: {
                correctAnswers,
                wrongAnswers,
                unanswered,
                completionRate,
                performanceLevel,
                questionsAnalyzed: quiz.questions.length
            },
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
                analysis: sub.analysis,
                submittedAt: sub.submittedAt
            }))
        });

    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ success: false, message: "Error fetching submissions" });
    }
});

// Delete quiz route
router.delete('/api/quizzes/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        
        // Find and delete the quiz
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
        
        if (!deletedQuiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Also delete related submissions
        await QuizSubmission.deleteMany({ quizId: quizId });
        
        res.status(200).json({
            success: true,
            message: "Quiz and related submissions deleted successfully"
        });
        
    } catch (err) {
        console.error('Error deleting quiz:', err);
        res.status(500).json({ success: false, message: "Error deleting quiz" });
    }
});

// Test route
router.get('/api/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: "Enhanced API with validation and analysis is working correctly",
        features: [
            "Quiz creation validation",
            "Detailed result analysis", 
            "Enhanced error handling",
            "Comprehensive scoring"
        ]
    });
});

module.exports = router;