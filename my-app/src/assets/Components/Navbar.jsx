import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMenuOpen(false); // Close mobile menu when resizing to desktop
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navbar = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: isMobile ? 'sticky' : 'fixed',
    top: 0,
    left: isMobile ? 0 : '50%',
    transform: isMobile ? 'none' : 'translateX(-50%)',
    width: isMobile ? '100%' : '80%',
    background: 'linear-gradient(to right, #4f46e5, #6366f1)',
    color: '#fff',
    padding: isMobile ? '8px 16px' : '12px 24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 1000,
    borderRadius: isMobile ? '0' : '20px',
    margin: isMobile ? '0' : '20px',
  };

  const logo = {
    fontSize: isMobile ? '18px' : '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const menu = {
    listStyle: 'none',
    display: isMobile ? (menuOpen ? 'flex' : 'none') : 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '15px' : '30px',
    margin: '0 auto',
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const navlink = {
    cursor: 'pointer',
    fontWeight: '500',
    transition: '0.3s',
  };
  
  const hamburger = {
    display: isMobile ? 'block' : 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
    marginRight: '0',
    width: '24px',
    height: '24px',
    position: 'relative',
    zIndex: 1100,
  };
  
  const bar = (index) => ({
    display: 'block',
    position: 'absolute',
    width: '22px',
    height: '2px',
    background: '#fff',
    borderRadius: '2px',
    transition: 'all 0.3s ease-in-out',
    left: 0,
    transform: menuOpen 
      ? index === 0 
        ? 'translateY(0px) rotate(45deg)'
        : index === 1 
          ? 'scaleX(0)'
          : 'translateY(0px) rotate(-45deg)'
      : `translateY(${(index - 1) * 6}px)`,
    opacity: menuOpen && index === 1 ? 0 : 1,
    top: '8px',
  });
  
  const authButtons = {
    display: 'flex',
    gap: '10px',
    marginLeft: isMobile ? 0 : '20px',
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '100%' : 'auto',
    alignItems: isMobile ? 'center' : 'flex-start',
    marginTop: isMobile ? '15px' : 0,
  };
  
  const loginButton = {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '2px solid #fff',
    transition: 'all 0.3s ease',
    width: isMobile ? '100%' : 'auto',
    textAlign: 'center',
  };
  
  const signupButton = {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#4f46e5',
    border: '2px solid #fff',
    transition: 'all 0.3s ease',
    width: isMobile ? '100%' : 'auto',
    textAlign: 'center',
  };
  
  const navContent = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: isMobile && menuOpen ? 'column' : 'row',
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: isMobile ? (menuOpen ? 'absolute' : 'relative') : 'relative',
    top: isMobile && menuOpen ? '100%' : 'auto',
    left: 0,
    width: '100%',
    background: isMobile && menuOpen ? 'linear-gradient(to right, #4f46e5, #6366f1)' : 'transparent',
    borderRadius: isMobile && menuOpen ? '0 0 10px 10px' : '0',
    padding: isMobile && menuOpen ? '10px 16px 20px' : '0',
    boxShadow: isMobile && menuOpen ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
    zIndex: 999,
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="navbar" style={navbar}>
      <h1 style={logo} onClick={() => navigate('/')}>QuizForce</h1>
      
      {/* Centered menu for desktop */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <ul style={menu}>
            <li style={navlink} onClick={() => navigate('/')}>Home</li>
            <li style={navlink}>Statistics</li>
            <li style={navlink}>Quizzes</li>
            <li style={navlink}>Blog</li>
          </ul>
        </div>
      )}
      
      {/* Auth buttons for desktop */}
      {!isMobile && (
        <div style={authButtons}>
          <div 
            style={loginButton}
            onClick={() => navigate('/login')}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Login
          </div>
          <div 
            style={signupButton}
            onClick={() => navigate('/signup')}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
          >
            Sign Up
          </div>
        </div>
      )}
      
      {/* Hamburger menu for mobile - positioned at the right end */}
      {isMobile && (
        <div 
          style={hamburger} 
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span style={bar(0)}></span>
          <span style={bar(1)}></span>
          <span style={bar(2)}></span>
        </div>
      )}
      
      {/* Mobile menu */}
      {isMobile && (
        <div 
          style={{
            ...navContent,
            transform: menuOpen ? 'translateY(0)' : 'translateY(-150%)',
            opacity: menuOpen ? 1 : 0,
            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
          }}
        >
          <ul style={menu}>
            <li style={navlink} onClick={() => { navigate('/'); setMenuOpen(false); }}>Home</li>
            <li style={navlink} onClick={() => setMenuOpen(false)}>Statistics</li>
            <li style={navlink} onClick={() => setMenuOpen(false)}>Quizzes</li>
            <li style={navlink} onClick={() => setMenuOpen(false)}>Blog</li>
          </ul>
          
          <div style={authButtons}>
            <div 
              style={loginButton}
              onClick={() => { navigate('/login'); setMenuOpen(false); }}
            >
              Login
            </div>
            <div 
              style={signupButton}
              onClick={() => { navigate('/signup'); setMenuOpen(false); }}
            >
              Sign Up
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
