import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_CLIENT_ID } from '../../config/google-config.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student'
  });

  // Load Google Identity Services script
  useEffect(() => {
    // Check if Google Client ID is properly configured
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.warn('Google OAuth is not properly configured. Please set up Google Client ID.');
      setError('Google Sign-In is not configured. Please use regular login or contact administrator.');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      try {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google OAuth:', error);
        setError('Google Sign-In initialization failed. Please use regular login.');
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      setError('Google Sign-In is currently unavailable. Please use regular login.');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      // Decode the JWT token to get user info
      const userInfo = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Create user object
      const googleUser = {
        id: userInfo.sub,
        fullName: userInfo.name,
        email: userInfo.email,
        role: formData.role || 'student', // Use selected role or default to student
        picture: userInfo.picture,
        authProvider: 'google'
      };

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(googleUser));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    // Check if Google Client ID is configured
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setError('Google Sign-In is not configured. Please set up Google OAuth or use regular login.');
      return;
    }

    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            setError('Google Sign-In popup was blocked. Please check your browser settings and disable ad blockers.');
          } else if (notification.isSkippedMoment()) {
            setError('Google Sign-In was skipped. Please try again or use regular login.');
          }
        });
      } else {
        setError('Google Sign-In is not loaded. Please refresh the page or use regular login.');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setError('Google Sign-In failed. Please try regular login instead.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
     
      localStorage.setItem('user', JSON.stringify(data.user));
      
      
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
      console.error('Login error:', err);
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
      marginBottom: '4px',
      textAlign: 'left',
      lineHeight: '1.2'
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
            <h1 style={styles.welcomeText}>Welcome back to Quiz-Force</h1>
            <p style={styles.subText}>
              Don't have an account? <a href="#" onClick={(e) => {e.preventDefault(); navigate('/signup')}} style={styles.link}>Sign Up</a>
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
              {loading ? 'Logging in...' : 'Login'}
            </div>

            <div style={styles.divider}>
              <div style={styles.line}></div>
              <span>or</span>
              <div style={styles.line}></div>
            </div>

            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
              Select your role above before signing in with Google
            </div>

            <div 
              style={{
                ...styles.button,
                backgroundColor: GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' ? '#f5f5f5' : '#fff',
                color: GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' ? '#999' : '#333',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' ? 'not-allowed' : 'pointer',
                opacity: GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' ? 0.6 : 1
              }}
              onClick={handleGoogleSignIn}
              onMouseOver={(e) => {
                if (GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
                  e.target.style.backgroundColor = '#fff';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}