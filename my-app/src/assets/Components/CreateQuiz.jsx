import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, GripVertical, Settings, AlignLeft, Check, Clock } from 'lucide-react';

export default function CreateQuiz() {
  const navigate = useNavigate();
  
  // Quiz details state
  const [quizDetails, setQuizDetails] = useState({
    title: 'Untitled Quiz',
    description: '',
    duration: 30, // minutes
    totalPoints: 0
  });

  // Questions state
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'multiple-choice',
      question: '',
      options: ['', ''],
      correctAnswer: null,
      points: 1,
      required: true
    }
  ]);

  // Function to update quiz details
  const updateQuizDetails = (field, value) => {
    setQuizDetails({
      ...quizDetails,
      [field]: value
    });
  };

  // Function to add a new question
  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      type: 'multiple-choice',
      question: '',
      options: ['', ''],
      correctAnswer: null,
      points: 1,
      required: true,
      image: null
    };
    
    setQuestions([...questions, newQuestion]);
  };

  // Function to update a question
  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  // Function to delete a question
  const deleteQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  // Function to add an option to a question
  const addOption = (questionId) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...q.options, ''] } 
          : q
      )
    );
  };

  // Function to update an option
  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Function to delete an option
  const deleteOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options.length > 2) {
          const newOptions = [...q.options];
          newOptions.splice(optionIndex, 1);
          // Reset correctAnswer if the deleted option was the correct one
          let updatedCorrectAnswer = q.correctAnswer;
          if (q.correctAnswer === optionIndex) {
            updatedCorrectAnswer = null;
          } else if (q.correctAnswer > optionIndex) {
            updatedCorrectAnswer = q.correctAnswer - 1;
          }
          return { 
            ...q, 
            options: newOptions,
            correctAnswer: updatedCorrectAnswer
          };
        }
        return q;
      })
    );
  };

  // Function to set the correct answer
  const setCorrectAnswer = (questionId, optionIndex) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId ? { ...q, correctAnswer: optionIndex } : q
      )
    );
  };

  // Function to change question type
  const changeQuestionType = (questionId, type) => {
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          // Reset options based on question type
          let options = q.options;
          let correctAnswer = q.correctAnswer;
          
          if (type === 'text') {
            options = [];
            correctAnswer = null;
          } else if (type === 'true-false') {
            options = ['True', 'False'];
            correctAnswer = null;
          } else if (q.options.length < 2) {
            options = ['', ''];
          }
          
          return { 
            ...q, 
            type,
            options,
            correctAnswer
          };
        }
        return q;
      })
    );
  };

  // Calculate total points
  const calculateTotalPoints = () => {
    return questions.reduce((total, q) => total + q.points, 0);
  };

  // Save quiz
  const saveQuiz = async () => {
    // Update total points before saving
    const totalPoints = calculateTotalPoints();
    
    // Get the logged in user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user || !user.name) {
      alert("You must be logged in to save a quiz");
      navigate('/login');
      return;
    }
    
    // Using email as a unique identifier since we don't have _id in the stored user object
    const quizData = {
      ...quizDetails,
      totalPoints,
      questions,
      userId: "admin", // Hardcoded for now until we implement proper user ID tracking
      createdBy: "admin" // Also sending createdBy to match our MongoDB schema
    };
    
    try {
      // Validate quiz data
      if (!quizData.title) {
        alert("Quiz title is required");
        return;
      }
      
      if (questions.length === 0) {
        alert("Quiz must have at least one question");
        return;
      }
      
      // Show a loading state
      const saveButton = document.querySelector("#saveQuizButton");
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
      }
      
      // Send the quiz data to the backend
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to save quiz");
      }
      
      alert("Quiz saved successfully!");
      
      // Navigate back to dashboard after saving
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert(`Failed to save quiz: ${error.message}`);
      
      // Reset button state
      const saveButton = document.querySelector("#saveQuizButton");
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "Save Quiz";
      }
    }
  };

  // Cancel quiz creation
  const cancelQuiz = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/dashboard');
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    titleInput: {
      fontSize: '24px',
      fontWeight: 'bold',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      width: '100%',
      maxWidth: '600px',
      outline: 'none'
    },
    actions: {
      display: 'flex',
      gap: '12px'
    },
    button: (isPrimary = false) => ({
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: isPrimary ? '#4f46e5' : '#f3f4f6',
      color: isPrimary ? 'white' : '#374151',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }),
    quizSettings: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '30px'
    },
    settingsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#4b5563'
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical'
    },
    questionContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb'
    },
    questionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    questionInput: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '16px'
    },
    optionsContainer: {
      marginTop: '16px'
    },
    optionItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      gap: '8px'
    },
    optionInput: {
      flex: 1,
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px'
    },
    addOptionBtn: {
      padding: '6px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    questionFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    typeSelector: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px',
      backgroundColor: '#fff'
    },
    pointsInput: {
      width: '60px',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '14px'
    },
    addQuestionBtn: {
      backgroundColor: '#f3f4f6',
      border: '1px dashed #d1d5db',
      color: '#4b5563',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      cursor: 'pointer',
      marginBottom: '40px',
      transition: 'all 0.2s'
    },
    saveBar: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#4b5563',
      cursor: 'pointer'
    },
    radioButton: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: '2px solid #d1d5db',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    },
    radioButtonSelected: {
      backgroundColor: '#4f46e5',
      border: '2px solid #4f46e5',
      color: 'white'
    }
  };

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.header}>
          <input 
            type="text" 
            value={quizDetails.title} 
            onChange={(e) => updateQuizDetails('title', e.target.value)}
            style={styles.titleInput}
            placeholder="Quiz Title"
          />
          <div style={styles.actions}>
            <button 
              style={styles.button()} 
              onClick={cancelQuiz}
            >
              <X size={18} /> Cancel
            </button>
            <button 
              style={styles.button(true)}
              onClick={saveQuiz}
            >
              <Check size={18} /> Save Quiz
            </button>
          </div>
        </div>

        {/* Quiz Settings */}
        <div style={styles.quizSettings}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Quiz Settings</h2>
          <div style={styles.settingsGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Quiz Description</label>
              <textarea 
                style={styles.textarea}
                value={quizDetails.description}
                onChange={(e) => updateQuizDetails('description', e.target.value)}
                placeholder="Enter quiz description or instructions"
              />
            </div>
            <div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Duration (minutes)</label>
                <input 
                  type="number"
                  style={styles.input}
                  value={quizDetails.duration}
                  onChange={(e) => updateQuizDetails('duration', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Total Points: {calculateTotalPoints()}</label>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((question, index) => (
          <div key={question.id} style={styles.questionContainer}>
            <div style={styles.questionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GripVertical size={20} color="#9ca3af" />
                <span style={{ fontWeight: '500', color: '#4b5563' }}>Question {index + 1}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={{ 
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#ef4444'
                  }}
                  onClick={() => deleteQuestion(question.id)}
                  disabled={questions.length === 1}
                  title="Delete question"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <input
              type="text"
              style={styles.questionInput}
              value={question.question}
              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
              placeholder="Enter question text"
            />

            {/* Question options based on type */}
            <div style={styles.optionsContainer}>
              {question.type === 'multiple-choice' && (
                <>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} style={styles.optionItem}>
                      <div 
                        style={{ 
                          ...styles.radioButton, 
                          ...(question.correctAnswer === optionIndex ? styles.radioButtonSelected : {}) 
                        }}
                        onClick={() => setCorrectAnswer(question.id, optionIndex)}
                      >
                        {question.correctAnswer === optionIndex && <Check size={14} />}
                      </div>
                      <input
                        type="text"
                        style={styles.optionInput}
                        value={option}
                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      {question.options.length > 2 && (
                        <button
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                          onClick={() => deleteOption(question.id, optionIndex)}
                          title="Delete option"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div 
                    style={{ 
                      marginTop: '8px',
                      padding: '8px',
                      color: '#4f46e5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px' 
                    }}
                    onClick={() => addOption(question.id)}
                  >
                    <Plus size={18} /> Add Option
                  </div>
                </>
              )}

              {question.type === 'text' && (
                <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <AlignLeft size={18} style={{ marginRight: '10px' }} />
                  <span style={{ color: '#6b7280' }}>Text answer field will appear here</span>
                </div>
              )}

              {question.type === 'true-false' && (
                <>
                  {['True', 'False'].map((option, optionIndex) => (
                    <div key={optionIndex} style={styles.optionItem}>
                      <div 
                        style={{ 
                          ...styles.radioButton, 
                          ...(question.correctAnswer === optionIndex ? styles.radioButtonSelected : {}) 
                        }}
                        onClick={() => setCorrectAnswer(question.id, optionIndex)}
                      >
                        {question.correctAnswer === optionIndex && <Check size={14} />}
                      </div>
                      <div style={{ flex: 1, padding: '10px' }}>{option}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div style={styles.questionFooter}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Question Type</label>
                  <select
                    style={styles.typeSelector}
                    value={question.type}
                    onChange={(e) => changeQuestionType(question.id, e.target.value)}
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="text">Text</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Points</label>
                  <input
                    type="number"
                    style={styles.pointsInput}
                    value={question.points}
                    onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
              </div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                />
                Required question
              </label>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <div 
          style={styles.addQuestionBtn}
          onClick={addQuestion}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ebedf0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        >
          <Plus size={24} style={{ margin: '0 auto 10px' }} />
          <div>Add Question</div>
        </div>

        {/* Save Bar */}
        <div style={{ height: '80px' }}></div> {/* Space for fixed save bar */}
        <div style={styles.saveBar}>
          <div>
            <span style={{ fontWeight: '500' }}>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
            <span style={{ marginLeft: '10px', color: '#6b7280' }}>Total {calculateTotalPoints()} points</span>
          </div>
          <div style={styles.actions}>
            <button 
              style={styles.button()} 
              onClick={cancelQuiz}
            >
              <X size={18} /> Cancel
            </button>
            <button 
              id="saveQuizButton"
              style={styles.button(true)}
              onClick={saveQuiz}
            >
              <Check size={18} /> Save Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}