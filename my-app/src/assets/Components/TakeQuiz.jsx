import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function TakeQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quiz && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted, quiz]);

  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
        const data = await response.json();
        
        if (response.ok) {
          setQuiz(data.quiz);
          setTimeRemaining(data.quiz.duration * 60); 
        } else {
          alert('Failed to load quiz');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        alert('Error loading quiz');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

 
  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (isSubmitted) return;
    
    // Calculate local score immediately
    const localScore = calculateScore();
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const submissionData = {
        quizId,
        answers,
        studentId: user.email || 'student'
      };

      const response = await fetch('http://localhost:5000/api/quiz-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

   
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setScore({ correct: data.score, total: data.totalPoints });
        } else {
          
          setScore(localScore);
        }
      } else {
       
        setScore(localScore);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      
      setScore(localScore);
    } finally {
      setIsSubmitted(true);
      setShowResults(true);
    }
  };

 
  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    let total = 0;
    
    quiz.questions.forEach((question, index) => {
      if (question.type !== 'text') { // Only score non-text questions automatically
        total += question.points;
        const userAnswer = answers[index];
        
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
            correct += question.points;
          }
        }
      }
    });
    
    return { correct, total };
  };

 
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

 
  const retryQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(quiz.duration * 60);
    setIsSubmitted(false);
    setScore(null);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>Quiz not found</div>
        <button style={styles.backButton} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Show results page
  if (showResults) {
    const localScore = calculateScore();
    return (
      <div style={styles.container}>
        <div style={styles.resultsContainer}>
          <div style={styles.resultsHeader}>
            <CheckCircle size={64} color="#10b981" />
            <h1 style={styles.resultsTitle}>Quiz Completed!</h1>
            <p style={styles.resultsSubtitle}>Here are your results</p>
          </div>
          
          <div style={styles.scoreCard}>
            <div style={styles.scoreDisplay}>
              <span style={styles.scoreNumber}>
                {typeof score === 'object' ? score.correct : score}
              </span>
              <span style={styles.scoreTotal}>
                / {typeof score === 'object' ? score.total : localScore.total}
              </span>
            </div>
            <p style={styles.scoreLabel}>Points Earned</p>
            <p style={styles.percentageScore}>
              {Math.round(((typeof score === 'object' ? score.correct : score) / 
                (typeof score === 'object' ? score.total : localScore.total)) * 100)}%
            </p>
          </div>

          <div style={styles.resultActions}>
            <button style={styles.retryButton} onClick={retryQuiz}>
              <RotateCcw size={20} /> Try Again
            </button>
            <button style={styles.dashboardButton} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>

          {/* Question Review */}
          <div style={styles.reviewSection}>
            <h3 style={styles.reviewTitle}>Review Your Answers</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} style={styles.reviewItem}>
                  <div style={styles.reviewQuestion}>
                    <span style={styles.questionNumber}>Q{index + 1}.</span>
                    <span>{question.question}</span>
                    {question.type !== 'text' && (
                      <span style={{
                        ...styles.correctIndicator,
                        color: isCorrect ? '#10b981' : '#ef4444'
                      }}>
                        {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </span>
                    )}
                  </div>
                  
                  {question.type === 'multiple-choice' && (
                    <div style={styles.reviewAnswers}>
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          style={{
                            ...styles.reviewOption,
                            backgroundColor: 
                              optionIndex === question.correctAnswer ? '#dcfce7' :
                              optionIndex === userAnswer && userAnswer !== question.correctAnswer ? '#fee2e2' :
                              '#f9fafb'
                          }}
                        >
                          <span style={styles.optionText}>{option}</span>
                          {optionIndex === question.correctAnswer && <CheckCircle size={16} color="#10b981" />}
                          {optionIndex === userAnswer && userAnswer !== question.correctAnswer && <XCircle size={16} color="#ef4444" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'text' && (
                    <div style={styles.textAnswer}>
                      <strong>Your answer:</strong> {userAnswer || 'No answer provided'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.quizTitle}>
          <h1>{quiz.title}</h1>
          <p style={styles.quizDescription}>{quiz.description}</p>
        </div>
        
        <div style={styles.timerContainer}>
          <Clock size={20} />
          <span style={{
            ...styles.timerText,
            color: timeRemaining < 300 ? '#ef4444' : '#4b5563' // Red if less than 5 minutes
          }}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${progress}%`}}></div>
        </div>
        <span style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      {/* Question */}
      <div style={styles.questionContainer}>
        <div style={styles.questionHeader}>
          <h2 style={styles.questionTitle}>
            Q{currentQuestionIndex + 1}. {currentQuestion.question}
          </h2>
          <span style={styles.questionPoints}>
            {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Answer options based on question type */}
        <div style={styles.answersContainer}>
          {currentQuestion.type === 'multiple-choice' && (
            <div style={styles.optionsContainer}>
              {currentQuestion.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  style={{
                    ...styles.optionItem,
                    backgroundColor: answers[currentQuestionIndex] === optionIndex ? '#eff6ff' : '#fff',
                    borderColor: answers[currentQuestionIndex] === optionIndex ? '#2563eb' : '#e5e7eb'
                  }}
                  onClick={() => handleAnswerChange(currentQuestionIndex, optionIndex)}
                >
                  <div style={{
                    ...styles.radioButton,
                    backgroundColor: answers[currentQuestionIndex] === optionIndex ? '#2563eb' : '#fff',
                    borderColor: answers[currentQuestionIndex] === optionIndex ? '#2563eb' : '#d1d5db'
                  }}>
                    {answers[currentQuestionIndex] === optionIndex && (
                      <div style={styles.radioButtonInner}></div>
                    )}
                  </div>
                  <span style={styles.optionText}>{option}</span>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div style={styles.optionsContainer}>
              {['True', 'False'].map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  style={{
                    ...styles.optionItem,
                    backgroundColor: answers[currentQuestionIndex] === optionIndex ? '#eff6ff' : '#fff',
                    borderColor: answers[currentQuestionIndex] === optionIndex ? '#2563eb' : '#e5e7eb'
                  }}
                  onClick={() => handleAnswerChange(currentQuestionIndex, optionIndex)}
                >
                  <div style={{
                    ...styles.radioButton,
                    backgroundColor: answers[currentQuestionIndex] === optionIndex ? '#2563eb' : '#fff',
                    borderColor: answers[currentQuestionIndex] === optionIndex ? '#2563eb' : '#d1d5db'
                  }}>
                    {answers[currentQuestionIndex] === optionIndex && (
                      <div style={styles.radioButtonInner}></div>
                    )}
                  </div>
                  <span style={styles.optionText}>{option}</span>
                </div>
              ))}
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <textarea
              style={styles.textInput}
              value={answers[currentQuestionIndex] || ''}
              onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
              placeholder="Enter your answer here..."
              rows={4}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        <button
          style={{
            ...styles.navButton,
            opacity: currentQuestionIndex === 0 ? 0.5 : 1
          }}
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft size={20} /> Previous
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button style={styles.submitButton} onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button style={styles.nextButton} onClick={nextQuestion}>
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Question overview */}
      <div style={styles.questionOverview}>
        <h4 style={styles.overviewTitle}>Questions Overview</h4>
        <div style={styles.questionGrid}>
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.questionButton,
                backgroundColor: 
                  index === currentQuestionIndex ? '#2563eb' :
                  answers[index] !== undefined ? '#10b981' : '#e5e7eb',
                color: 
                  index === currentQuestionIndex ? '#fff' :
                  answers[index] !== undefined ? '#fff' : '#4b5563'
              }}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  loadingText: {
    fontSize: '18px',
    color: '#6b7280'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '20px'
  },
  errorText: {
    fontSize: '18px',
    color: '#ef4444'
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  quizTitle: {
    flex: 1
  },
  quizDescription: {
    color: '#6b7280',
    margin: '5px 0 0 0'
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  timerText: {
    fontSize: '18px',
    fontWeight: '600'
  },
  progressContainer: {
    marginBottom: '30px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  questionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    flex: 1
  },
  questionPoints: {
    fontSize: '14px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  answersContainer: {
    marginTop: '20px'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  radioButton: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  radioButtonInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff'
  },
  optionText: {
    fontSize: '16px',
    color: '#1f2937'
  },
  textInput: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  questionOverview: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  overviewTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#1f2937'
  },
  questionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
    gap: '8px'
  },
  questionButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  resultsHeader: {
    marginBottom: '30px'
  },
  resultsTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '20px 0 10px 0'
  },
  resultsSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  scoreCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px'
  },
  scoreDisplay: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '10px'
  },
  scoreNumber: {
    color: '#10b981'
  },
  scoreTotal: {
    color: '#6b7280'
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 10px 0'
  },
  percentageScore: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2563eb',
    margin: 0
  },
  resultActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '40px'
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  dashboardButton: {
    padding: '12px 20px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  reviewSection: {
    textAlign: 'left',
    marginTop: '40px'
  },
  reviewTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1f2937'
  },
  reviewItem: {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  reviewQuestion: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: '500'
  },
  questionNumber: {
    color: '#2563eb',
    fontWeight: '600'
  },
  correctIndicator: {
    marginLeft: 'auto'
  },
  reviewAnswers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px'
  },
  reviewOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px'
  },
  textAnswer: {
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    fontSize: '14px'
  }
};