const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const UserModel = require("./Config");
const { Quiz, QuizSubmission } = require("./Config");

/* ------------------------ SIGNUP ------------------------ */
router.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating user" });
  }
});

/* ------------------------ LOGIN ------------------------ */
router.post("/api/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let query = { email };
    if (role) query.role = role;

    const user = await UserModel.findOne(query);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or role",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ------------------------ CREATE QUIZ ------------------------ */
router.post("/api/quizzes", async (req, res) => {
  try {
    const { title, description, duration, totalPoints, questions, userId } = req.body;

    const validationErrors = [];

    /* Basic quiz validations */
    if (!title || title.trim().length < 3) {
      validationErrors.push("Title must be at least 3 characters");
    }

    if (!duration || duration < 5) {
      validationErrors.push("Duration must be at least 5 minutes");
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      validationErrors.push("At least one question is required");
    }

    /* Per-question validations */
    questions.forEach((q, i) => {
      const qNum = i + 1;

      if (!q.question || q.question.trim().length < 5) {
        validationErrors.push(`Question ${qNum}: Text must be at least 5 characters`);
      }

      if (!["multiple-choice", "text", "true-false"].includes(q.type)) {
        validationErrors.push(`Question ${qNum}: Invalid type`);
      }

      if (q.type === "multiple-choice") {
        if (!q.options || q.options.length < 2) {
          validationErrors.push(`Question ${qNum}: Must have at least 2 options`);
        }

        if (q.correctAnswer == null || q.correctAnswer >= q.options.length) {
          validationErrors.push(`Question ${qNum}: Invalid correct answer`);
        }
      }

      if (q.type === "true-false") {
        if (q.correctAnswer !== 0 && q.correctAnswer !== 1) {
          validationErrors.push(`Question ${qNum}: Correct answer must be 0/1`);
        }
      }

      if (!q.points || q.points < 1 || q.points > 10) {
        validationErrors.push(`Question ${qNum}: Points must be 1–10`);
      }
    });

    /* Total points validation */
    if (totalPoints < 1 || totalPoints > 100) {
      validationErrors.push("Total points must be between 1 and 100");
    }

    /* If any errors → stop */
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const creatorId = userId || "admin";

    const newQuiz = await Quiz.create({
      title: title.trim(),
      description: description?.trim() || "",
      duration,
      totalPoints,
      questions: questions.map((q) => ({
        ...q,
        question: q.question.trim(),
        options: q.options ? q.options.map((opt) => opt.trim()) : [],
      })),
      createdBy: creatorId,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: {
        id: newQuiz._id,
        title: newQuiz.title,
        description: newQuiz.description,
        duration: newQuiz.duration,
        totalPoints: newQuiz.totalPoints,
        questionCount: newQuiz.questions.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error creating quiz",
      error: err.message,
    });
  }
});

/* ------------------------ GET ALL QUIZZES ------------------------ */
router.get("/api/quizzes", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { createdBy: userId } : {};

    const quizzes = await Quiz.find(filter)
      .select("title description duration totalPoints status questions createdAt")
      .sort({ createdAt: -1 });

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
          createdAt: quiz.createdAt,
        };
      })
    );

    res.status(200).json({ success: true, quizzes: quizzesWithParticipants });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching quizzes" });
  }
});

/* ------------------------ GET QUIZ BY ID ------------------------ */
router.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.status(200).json({ success: true, quiz });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching quiz" });
  }
});

/* ------------------------ SUBMIT QUIZ ------------------------ */
router.post("/api/quiz-submissions", async (req, res) => {
  try {
    const { quizId, answers, studentId } = req.body;

    if (!quizId || !answers || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: quizId, answers, studentId",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let score = 0;
    let totalPoints = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    const questionAnalysis = [];

    quiz.questions.forEach((q, index) => {
      totalPoints += q.points;
      const userAnswer = answers[index];
      let isCorrect = false;
      let status = 'unanswered';

      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          isCorrect = userAnswer === q.correctAnswer;
          if (isCorrect) {
            score += q.points;
            correctAnswers++;
            status = 'correct';
          } else {
            wrongAnswers++;
            status = 'incorrect';
          }
        } else if (q.type === 'text') {
          // Enhanced text answer validation
          const userText = String(userAnswer).trim();
          const expectedText = String(q.expectedAnswer || '').trim();
          
          if (userText && expectedText) {
            let textIsCorrect = false;
            
            // Check validation settings
            const caseSensitive = q.validation?.caseSensitive || false;
            const exactMatch = q.validation?.exactMatch || false;
            
            const userNormalized = caseSensitive ? userText : userText.toLowerCase();
            const expectedNormalized = caseSensitive ? expectedText : expectedText.toLowerCase();
            
            if (exactMatch) {
              textIsCorrect = userNormalized === expectedNormalized;
            } else {
              // Partial match - check if user answer contains expected keywords
              const expectedKeywords = expectedNormalized.split(/\s+/).filter(word => word.length > 2);
              const userWords = userNormalized.split(/\s+/);
              
              if (expectedKeywords.length > 0) {
                const matchingKeywords = expectedKeywords.filter(keyword => 
                  userWords.some(userWord => userWord.includes(keyword) || keyword.includes(userWord))
                );
                
                // Consider correct if at least 60% of keywords match
                textIsCorrect = (matchingKeywords.length / expectedKeywords.length) >= 0.6;
              } else {
                textIsCorrect = userNormalized.includes(expectedNormalized) || 
                              expectedNormalized.includes(userNormalized);
              }
            }
            
            if (textIsCorrect) {
              score += q.points;
              correctAnswers++;
              status = 'correct';
              isCorrect = true;
            } else {
              wrongAnswers++;
              status = 'partially_correct'; // For manual review
            }
          } else {
            status = 'needs_review';
          }
        }
      } else {
        unanswered++;
      }

      questionAnalysis.push({
        questionIndex: index,
        questionText: q.question,
        questionType: q.type,
        userAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        expectedAnswer: q.expectedAnswer,
        options: q.options,
        points: q.points,
        isCorrect: isCorrect,
        status: status
      });
    });

    // Calculate performance metrics
    const scorePercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const completionRate = quiz.questions.length > 0 ? 
      Math.round(((quiz.questions.length - unanswered) / quiz.questions.length) * 100) : 0;
    
    // Performance level classification
    let performanceLevel = 'Poor';
    if (scorePercentage >= 90) performanceLevel = 'Excellent';
    else if (scorePercentage >= 80) performanceLevel = 'Good';
    else if (scorePercentage >= 70) performanceLevel = 'Average';
    else if (scorePercentage >= 60) performanceLevel = 'Below Average';

    // Save submission with analysis
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
        questionAnalysis
      },
      submittedAt: new Date(),
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
        questionsAnalyzed: quiz.questions.length,
        questionAnalysis
      },
      submissionId: submission._id,
    });
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ success: false, message: "Error submitting quiz" });
  }
});

/* ------------------------ GET SUBMISSIONS ------------------------ */
router.get("/api/quiz-submissions", async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId required" });
    }

    const submissions = await QuizSubmission.find({ studentId })
      .populate("quizId", "title totalPoints")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      submissions: submissions.map((s) => ({
        id: s._id,
        quiz: s.quizId,
        score: s.score,
        totalPoints: s.totalPoints,
        submittedAt: s.submittedAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching submissions" });
  }
});

/* ------------------------ TEST ROUTE ------------------------ */
router.get("/api/test", (req, res) => {
  res.status(200).json({ success: true, message: "API is working" });
});

module.exports = router;
