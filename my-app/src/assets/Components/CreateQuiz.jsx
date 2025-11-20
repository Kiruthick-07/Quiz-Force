import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  AlignLeft,
  Check,
  Clock
} from 'lucide-react';

/**
 * Fixed and cleaned CreateQuiz component
 * - All helper functions implemented
 * - Single validateQuiz implementation
 * - Proper option deletion handling (adjusts correctAnswer)
 * - No syntax errors; uses React best-practices
 */

const makeQuestion = (overrides = {}) => ({
  id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  type: 'multiple-choice', // 'multiple-choice' | 'true-false' | 'text'
  question: '',
  points: 1,
  required: false,
  options: ['', ''], // default for multiple-choice
  correctAnswer: null, // index for MCQ and true/false (0 = first)
  expectedAnswer: '',
  validation: {
    caseSensitive: false,
    exactMatch: false
  },
  ...overrides
});

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [quizDetails, setQuizDetails] = useState({
    title: 'Untitled Quiz',
    description: '',
    duration: 30, // minutes
    totalPoints: 0
  });

  const [questions, setQuestions] = useState([makeQuestion()]);

  const [isSaving, setIsSaving] = useState(false);

  // ---------- Helpers ----------
  const updateQuizDetails = (key, value) => {
    setQuizDetails(prev => ({ ...prev, [key]: value }));
  };

  const addQuestion = (overrides = {}) => {
    setQuestions(prev => [...prev, makeQuestion(overrides)]);
  };

  const deleteQuestion = (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    setQuestions(prev => {
      const next = prev.filter(q => q.id !== questionId);
      // Ensure at least one question remains
      return next.length ? next : [makeQuestion()];
    });
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  // For nested updates (like validation object)
  const updateQuestionNested = (questionId, fieldPath, value) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const copy = { ...q };
        // support simple one-level path like 'validation.caseSensitive'
        const parts = fieldPath.split('.');
        let cur = copy;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i];
          cur[p] = { ...(cur[p] || {}) };
          cur = cur[p];
        }
        cur[parts[parts.length - 1]] = value;
        return copy;
      })
    );
  };

  const addOption = (questionId) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const nextOptions = [...(q.options || [])];
        if (nextOptions.length >= 6) return q; // cap at 6
        nextOptions.push('');
        return { ...q, options: nextOptions };
      })
    );
  };

  const deleteOption = (questionId, optionIndex) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const opts = Array.isArray(q.options) ? [...q.options] : [];
        if (opts.length <= 2) return q; // keep at least 2 for MCQ
        opts.splice(optionIndex, 1);

        // adjust correctAnswer if necessary
        let updatedCorrect = q.correctAnswer;
        if (updatedCorrect === optionIndex) {
          updatedCorrect = null;
        } else if (typeof updatedCorrect === 'number' && updatedCorrect > optionIndex) {
          updatedCorrect = updatedCorrect - 1;
        }

        return { ...q, options: opts, correctAnswer: updatedCorrect };
      })
    );
  };

  const updateOptionValue = (questionId, index, value) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        const opts = Array.isArray(q.options) ? [...q.options] : [];
        opts[index] = value;
        return { ...q, options: opts };
      })
    );
  };

  const setCorrectAnswer = (questionId, optionIndex) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, correctAnswer: optionIndex } : q
      )
    );
  };

  const changeQuestionType = (questionId, type) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId) return q;
        if (type === 'text') {
          return {
            ...q,
            type,
            options: [],
            correctAnswer: null,
            expectedAnswer: q.expectedAnswer || ''
          };
        } else if (type === 'true-false') {
          // initialize True/False options and reset correctAnswer
          return {
            ...q,
            type,
            options: ['True', 'False'],
            correctAnswer: null,
            expectedAnswer: ''
          };
        } else {
          // multiple-choice
          const opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['', ''];
          return {
            ...q,
            type,
            options: opts,
            correctAnswer: null,
            expectedAnswer: ''
          };
        }
      })
    );
  };

  const calculateTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  };

  // ---------- Validation ----------
  const validateQuiz = () => {
    const errors = [];
    const trimmedTitle = (quizDetails.title || '').trim();

    // Quiz-level checks
    if (!trimmedTitle) errors.push('Quiz title is required');
    else if (trimmedTitle.length < 3) errors.push('Quiz title must be at least 3 characters');

    if (typeof quizDetails.duration !== 'number' || Number.isNaN(quizDetails.duration)) {
      errors.push('Quiz duration must be a number');
    } else {
      if (quizDetails.duration < 5) errors.push('Quiz duration must be at least 5 minutes');
      if (quizDetails.duration > 180) errors.push('Quiz duration cannot exceed 3 hours (180 minutes)');
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      errors.push('Quiz must have at least one question');
    } else if (questions.length > 50) {
      errors.push('Quiz cannot have more than 50 questions');
    }

    // Questions validations
    questions.forEach((question, idx) => {
      const qnum = idx + 1;
      const qText = (question.question || '').trim();
      if (!qText) errors.push(`Question ${qnum}: Question text is required`);
      else if (qText.length < 5) errors.push(`Question ${qnum}: Question must be at least 5 characters`);

      const pts = Number(question.points) || 0;
      if (pts < 1) errors.push(`Question ${qnum}: Points must be at least 1`);
      if (pts > 10) errors.push(`Question ${qnum}: Points cannot exceed 10 per question`);

      if (question.type === 'multiple-choice') {
        const opts = Array.isArray(question.options) ? question.options : [];
        if (opts.length < 2) errors.push(`Question ${qnum}: Multiple choice questions need at least 2 options`);
        if (opts.length > 6) errors.push(`Question ${qnum}: Multiple choice questions cannot have more than 6 options`);

        const trimmedOptions = opts.map(o => (o || '').trim());
        if (trimmedOptions.some(opt => !opt)) {
          errors.push(`Question ${qnum}: All options must have content`);
        }

        const unique = new Set(trimmedOptions.filter(Boolean));
        if (unique.size !== trimmedOptions.filter(Boolean).length) {
          errors.push(`Question ${qnum}: Options must be unique`);
        }

        if (question.correctAnswer === null || question.correctAnswer === undefined) {
          errors.push(`Question ${qnum}: Please select the correct answer`);
        } else if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= opts.length) {
          errors.push(`Question ${qnum}: Correct answer index is invalid`);
        }
      }

      if (question.type === 'true-false') {
        if (question.correctAnswer === null || question.correctAnswer === undefined) {
          errors.push(`Question ${qnum}: Please select True or False as the correct answer`);
        } else if (![0, 1].includes(question.correctAnswer)) {
          errors.push(`Question ${qnum}: True/False correct answer must be 0 (True) or 1 (False)`);
        }
      }

      if (question.type === 'text') {
        const expected = (question.expectedAnswer || '').trim();
        if (!expected) errors.push(`Question ${qnum}: Expected answer is required for text questions`);
        else if (expected.length < 2) errors.push(`Question ${qnum}: Expected answer must be at least 2 characters`);
      }
    });

    // total points check
    const total = calculateTotalPoints();
    if (total < 1) errors.push('Quiz must have at least 1 total point');
    if (total > 100) errors.push('Quiz total points cannot exceed 100');

    return errors;
  };

  const showValidationErrors = (errors) => {
    const message = `Please fix the following issues:\n\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
    alert(message);
  };

  // ---------- Save ----------
  const saveQuiz = async () => {
    const validationErrors = validateQuiz();
    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !user.name) {
      alert('You must be logged in to save a quiz');
      navigate('/login');
      return;
    }

    const quizData = {
      ...quizDetails,
      totalPoints: calculateTotalPoints(),
      questions,
      userId: user.email || 'unknown',
      createdBy: user.name || 'unknown',
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to save quiz');
      }

      alert(`Quiz saved successfully!\nTitle: ${quizData.title}\nQuestions: ${questions.length}\nTotal Points: ${quizData.totalPoints}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Save error', err);
      alert(`Failed to save quiz: ${err.message}`);
      setIsSaving(false);
    }
  };

  const cancelQuiz = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/dashboard');
    }
  };

  // ---------- Render ----------
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
            <button style={styles.button()} onClick={cancelQuiz} type="button">
              <X size={18} /> Cancel
            </button>
            <button
              style={styles.button(true)}
              onClick={saveQuiz}
              type="button"
              disabled={isSaving}
            >
              <Check size={18} /> {isSaving ? 'Saving...' : 'Save Quiz'}
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
                  onChange={(e) => updateQuizDetails('duration', parseInt(e.target.value, 10) || 0)}
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

            {/* Options / Type specific UI */}
            <div style={styles.optionsContainer}>
              {question.type === 'multiple-choice' && (
                <>
                  <div style={styles.answerSelectionHeader}>
                    <span style={styles.answerLabel}>Select Correct Answer:</span>
                    {question.correctAnswer === null && (
                      <span style={styles.warningText}>⚠️ No correct answer selected</span>
                    )}
                  </div>
                  {question.options.map((opt, optIdx) => (
                    <div key={optIdx} style={styles.optionItem}>
                      <div
                        style={{
                          ...styles.radioButton,
                          ...(question.correctAnswer === optIdx ? styles.radioButtonSelected : {})
                        }}
                        onClick={() => setCorrectAnswer(question.id, optIdx)}
                        title="Click to mark as correct answer"
                      >
                        {question.correctAnswer === optIdx && <Check size={14} />}
                      </div>
                      <input
                        type="text"
                        style={{
                          ...styles.optionInput,
                          ...(question.correctAnswer === optIdx ? styles.correctOptionInput : {})
                        }}
                        value={opt}
                        onChange={(e) => updateOptionValue(question.id, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                      />
                      {question.correctAnswer === optIdx && (
                        <span style={styles.correctBadge}>✓ Correct</span>
                      )}
                      {question.options.length > 2 && (
                        <button
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                          onClick={() => deleteOption(question.id, optIdx)}
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
                <div style={{ marginTop: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '16px' }}>
                    <AlignLeft size={18} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                    <span style={{ color: '#6b7280' }}>Students will type their answer in a text field</span>
                  </div>

                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                    <label style={{ ...styles.label, color: '#92400e', fontWeight: '600' }}>Expected Answer (Required for Auto-Grading)</label>
                    <textarea
                      style={{
                        ...styles.textarea,
                        borderColor: !question.expectedAnswer ? '#ef4444' : '#10b981',
                        backgroundColor: !question.expectedAnswer ? '#fef2f2' : '#f0fdf4'
                      }}
                      placeholder="Enter the expected answer or key points that students should mention..."
                      value={question.expectedAnswer || ''}
                      onChange={(e) => updateQuestion(question.id, 'expectedAnswer', e.target.value)}
                      rows="3"
                    />
                    {!question.expectedAnswer && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>
                        ⚠️ Expected answer is required for automatic validation
                      </div>
                    )}

                    <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
                        <input
                          type="checkbox"
                          checked={question.validation?.caseSensitive || false}
                          onChange={(e) => updateQuestionNested(question.id, 'validation.caseSensitive', e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Case Sensitive
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280' }}>
                        <input
                          type="checkbox"
                          checked={question.validation?.exactMatch || false}
                          onChange={(e) => updateQuestionNested(question.id, 'validation.exactMatch', e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Exact Match Required
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {question.type === 'true-false' && (
                <>
                  <div style={styles.answerSelectionHeader}>
                    <span style={styles.answerLabel}>Select Correct Answer:</span>
                    {question.correctAnswer === null && (
                      <span style={styles.warningText}>⚠️ No correct answer selected</span>
                    )}
                  </div>
                  {['True', 'False'].map((label, optIdx) => (
                    <div key={optIdx} style={styles.optionItem}>
                      <div
                        style={{
                          ...styles.radioButton,
                          ...(question.correctAnswer === optIdx ? styles.radioButtonSelected : {})
                        }}
                        onClick={() => setCorrectAnswer(question.id, optIdx)}
                        title="Click to mark as correct answer"
                      >
                        {question.correctAnswer === optIdx && <Check size={14} />}
                      </div>
                      <div style={{
                        flex: 1, 
                        padding: '10px',
                        fontWeight: question.correctAnswer === optIdx ? '600' : '400',
                        color: question.correctAnswer === optIdx ? '#059669' : '#374151'
                      }}>
                        {label}
                        {question.correctAnswer === optIdx && (
                          <span style={styles.correctBadge}> ✓ Correct</span>
                        )}
                      </div>
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
                    onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value, 10) || 0)}
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
          onClick={() => addQuestion()}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ebedf0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
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
            <button style={styles.button()} onClick={cancelQuiz} type="button">
              <X size={18} /> Cancel
            </button>
            <button
              id="saveQuizButton"
              style={styles.button(true)}
              onClick={saveQuiz}
              type="button"
              disabled={isSaving}
            >
              <Check size={18} /> {isSaving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Styles ----------
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
  },
  answerSelectionHeader: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  answerLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  warningText: {
    fontSize: '12px',
    color: '#dc2626',
    fontWeight: '500'
  },
  correctOptionInput: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4'
  },
  correctBadge: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: '600',
    padding: '4px 8px',
    backgroundColor: '#d1fae5',
    borderRadius: '4px'
  }
};
