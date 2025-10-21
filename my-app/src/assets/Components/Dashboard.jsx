import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Users, BarChart3, Clock, Share2, Edit, Trash2, Play, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuizDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: 'Total Quizzes', value: '24', icon: BookOpen, color: '#2563eb' },
    { label: 'Active Assessments', value: '12', icon: Play, color: '#10b981' },
    { label: 'Total Participants', value: '17', icon: Users, color: '#f59e0b' },
    { label: 'Avg. Completion', value: '87%', icon: BarChart3, color: '#8b5cf6' }
  ];

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        // Add the API call to delete the quiz (not implemented in backend yet)
        // For now, just update the local state
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        
        // In a real implementation, you would call an API endpoint like this:
        // const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
        //   method: 'DELETE',
        // });
        // if (response.ok) {
        //   setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        // } else {
        //   console.error("Failed to delete quiz");
        // }
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  // Check if user is logged in and set role
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      // Check if user is admin
      setIsAdmin(userData.role === 'admin');
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch quizzes from backend
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/quizzes');
        const data = await response.json();
        
        if (response.ok) {
          // Transform data to match the expected format
          const formattedQuizzes = data.quizzes.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            questions: quiz.questionCount,
            participants: 0, // Default value, would come from a different endpoint
            duration: 30, // Default value, would come from quiz.duration
            status: 'active', // Default value
            created: new Date(quiz.createdAt).toISOString().split('T')[0]
          }));
          
          setQuizzes(formattedQuizzes);
        } else {
          console.error('Failed to fetch quizzes:', data.message);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyle = {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.5rem 2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  };

  const headerContentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  };

  const createButtonStyle = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
  };

  const mainContentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem'
  };

  const tabContainerStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.5rem'
  };

  const tabStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    color: isActive ? '#2563eb' : '#64748b',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent'
  });

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  const statCardStyle = {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0'
  };

  const statHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  };

  const statLabelStyle = {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500'
  };

  const statValueStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b'
  };

  const quizListStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  const quizListHeaderStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  };

  const quizItemStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s'
  };

  const quizInfoStyle = {
    flex: 1
  };

  const quizTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  };

  const quizMetaStyle = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const metaItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#64748b',
    fontSize: '0.875rem'
  };

  const statusBadgeStyle = (status) => ({
    padding: '0.375rem 0.875rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: status === 'active' ? '#dcfce7' : '#fef3c7',
    color: status === 'active' ? '#166534' : '#92400e'
  });

  const actionButtonsStyle = {
    display: 'flex',
    gap: '0.5rem'
  };

  const iconButtonStyle = (color) => ({
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  });

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <h1 style={titleStyle}>
            {user ? `Welcome ${user.name} (${user.role})` : 'Quiz Dashboard'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Only admin can create quizzes */}
            {isAdmin && (
              <button 
                style={createButtonStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                onClick={() => navigate('/create-quiz')}
              >
                <Plus size={20} />
                Create New Quiz
              </button>
            )}
            <button 
              style={{
                ...createButtonStyle,
                backgroundColor: '#f43f5e',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e11d48'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f43f5e'}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={mainContentStyle}>
        <div style={tabContainerStyle}>
          <button 
            style={tabStyle(activeTab === 'overview')}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            style={tabStyle(activeTab === 'myquizzes')}
            onClick={() => setActiveTab('myquizzes')}
          >
            {isAdmin ? 'Manage Quizzes' : 'My Quizzes'}
          </button>
          {/* Analytics tab only for admin */}
          {isAdmin && (
            <button 
              style={tabStyle(activeTab === 'analytics')}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          )}
          {!isAdmin && (
            <button 
              style={tabStyle(activeTab === 'results')}
              onClick={() => setActiveTab('results')}
            >
              My Results
            </button>
          )}
        </div>

        {activeTab === 'overview' && (
          <>
            <div style={statsGridStyle}>
              {stats.map((stat, index) => (
                <div key={index} style={statCardStyle}>
                  <div style={statHeaderStyle}>
                    <span style={statLabelStyle}>{stat.label}</span>
                    <div style={{ 
                      padding: '0.5rem', 
                      backgroundColor: `${stat.color}15`,
                      borderRadius: '8px'
                    }}>
                      <stat.icon size={24} color={stat.color} />
                    </div>
                  </div>
                  <div style={statValueStyle}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={quizListStyle}>
              <div style={quizListHeaderStyle}>
                <h2 style={sectionTitleStyle}>Recent Quizzes</h2>
              </div>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Loading quizzes...
                </div>
              ) : quizzes.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No quizzes found. Click the "Create New Quiz" button to create your first quiz.
                </div>
              ) : quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  style={quizItemStyle}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={quizInfoStyle}>
                    <div style={quizTitleStyle}>{quiz.title}</div>
                    <div style={quizMetaStyle}>
                      <span style={metaItemStyle}>
                        <BookOpen size={16} />
                        {quiz.questions} questions
                      </span>
                      <span style={metaItemStyle}>
                        <Users size={16} />
                        {quiz.participants} participants
                      </span>
                      <span style={metaItemStyle}>
                        <Clock size={16} />
                        {quiz.duration} min
                      </span>
                      <span style={statusBadgeStyle(quiz.status)}>
                        {quiz.status}
                      </span>
                    </div>
                  </div>
                  <div style={actionButtonsStyle}>
                    <button 
                      style={iconButtonStyle('#2563eb')}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                    {/* Edit button - admin only */}
                    {isAdmin && (
                      <button 
                        style={iconButtonStyle('#2563eb')}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {/* Delete button - admin only */}
                    {isAdmin && (
                      <button 
                        style={iconButtonStyle('#dc2626')}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'myquizzes' && (
          <div style={quizListStyle}>
            <div style={quizListHeaderStyle}>
              <h2 style={sectionTitleStyle}>All My Quizzes</h2>
            </div>
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <p>You have {quizzes.length} quizzes created</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={quizListStyle}>
            <div style={quizListHeaderStyle}>
              <h2 style={sectionTitleStyle}>Analytics & Reports</h2>
            </div>
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <BarChart3 size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <p>Detailed analytics and performance reports</p>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div style={quizListStyle}>
            <div style={quizListHeaderStyle}>
              <h2 style={sectionTitleStyle}>My Quiz Results</h2>
            </div>
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <p>You haven't taken any quizzes yet</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}