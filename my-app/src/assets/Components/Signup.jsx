import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'student'
      });
      
     
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isMobile = window.innerWidth <= 768;

  const styles = {
    container: {
      height: '100vh',
      width:'100%',
      background: 'linear-gradient(to right, #e0f2fe,rgb(199, 235, 252))',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      maxWidth: '1000px',
      maxHeight: '90vh',
      width: '100%',
      overflow: 'hidden',
      flexDirection: 'row'
    },
    '@media (maxWidth: 768px)': {
      card: {
        flexDirection: 'column'
      }
    },
    leftSection: {
      flex: '1',
      padding: '30px 20px',
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9ff',
      overflow: 'hidden'
    },
    rightSection: {
      flex: '1',
      padding: '30px 40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'auto'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#333'
    },
    logoIcon: {
      fontSize: '24px'
    },
    illustration: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '15px'
    },
    questionMark: {
      fontSize: '120px',
      fontWeight: 'bold',
      color: '#667eea',
      position: 'relative'
    },
    person: {
      position: 'absolute',
      fontSize: '40px'
    },
    personLeft: {
      left: '-60px',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    personRight: {
      right: '-60px',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    tagline: {
      fontSize: '16px',
      color: '#666',
      textAlign: 'center',
      lineHeight: '1.5'
    },
    dots: {
      display: 'flex',
      gap: '8px',
      marginTop: '30px',
      justifyContent: 'center'
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#667eea'
    },
    dotInactive: {
      backgroundColor: '#ddd'
    },
    header: {
      marginBottom: '20px'
    },
    welcomeText: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#333',
      marginBottom: '4px'
    },
    subText: {
      fontSize: '14px',
      color: '#999'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    label: {
      fontSize: '12px',
      color: '#666',
      fontWeight: '500'
    },
    input: {
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.3s',
      fontFamily: 'inherit'
    },
    passwordWrapper: {
      position: 'relative'
    },
    eyeIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#999'
    },
    button: {
      padding: '12px',
      fontSize: '15px',
      fontWeight: '600',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      textAlign:'center',
      borderRadius: '8px',
      cursor: 'pointer',
      marginTop: '5px',
      transition: 'background-color 0.3s'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      margin: '20px 0',
      fontSize: '13px',
      color: '#999'
    },
    line: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e0e0e0'
    },
    socialButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center'
    },
    socialButton: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      backgroundColor: 'white'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.leftSection}>
          <div style={styles.logo}>
            <span>QuizForce</span>
          </div>
          
          <div style={styles.illustration}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <img src='/quiz-img1.png' style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}></img>
            </div>
          </div>
          
          
          <div style={styles.dots}>
            <div style={styles.dot}></div>
            <div style={{ ...styles.dot, ...styles.dotInactive }}></div>
            <div style={{ ...styles.dot, ...styles.dotInactive }}></div>
          </div>
        </div>

        <div style={styles.rightSection}>
          <div style={styles.header}>
            <h1 style={styles.welcomeText}>Welcome to Quiz-Force</h1>
            <p style={styles.subText}>
              Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login')}} style={styles.link}>Sign In</a>
            </p>
          </div>

          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <div style={styles.label}>Enter Name</div>
              <input
                type="text"
                name="fullName"
                placeholder="Enter Your Name"
                value={formData.fullName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.label}>Email</div>
              <input
                type="email"
                name="email"
                placeholder="Enter Your Mail-id"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.label}>Role</div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{...styles.input, cursor: 'pointer'}}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.label}>Enter Password</div>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                />
                <div 
                  style={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '10px', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            {successMessage && (
              <div style={{ color: 'green', fontSize: '14px', marginTop: '10px', textAlign: 'center' }}>
                {successMessage}
              </div>
            )}
            
            <div 
              style={{
                ...styles.button,
                backgroundColor: loading ? '#a0aae9' : '#667eea',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleSubmit}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#5568d3')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#667eea')}
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}