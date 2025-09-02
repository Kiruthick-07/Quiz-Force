import React from 'react';

const Navbar = () => {
  const navbar = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#4A90E2', // quiz theme color (blue)
    color: '#fff',
    padding: '12px 24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 1000,
  };

  const logo = {
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const menu = {
    listStyle: 'none',
    display: 'flex',
    gap: '30px',
    margin: 0,
    padding: 0,
    marginLeft: '60px',
  };

  const navlink = {
    cursor: 'pointer',
    fontWeight: '500',
    transition: '0.3s',
  };

  return (
    <div className="navbar" style={navbar}>
      <h1 style={logo}>QuizForce</h1>
      <ul style={menu}>
        <li style={navlink}>Home</li>
        <li style={navlink}>Statistics</li>
        <li style={navlink}>Quizzes</li>
        <li style={navlink}>Blog</li>
      </ul>
    </div>
  );
};

export default Navbar;
