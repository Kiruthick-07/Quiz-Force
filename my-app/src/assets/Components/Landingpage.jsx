import React from 'react'
import { useNavigate } from 'react-router-dom'

const Landingpage = () => {
    const navigate = useNavigate()
    
    const body = {
        display:'flex',
        marginTop:'200px',
        marginLeft:'55px',
        
    }
    const headtxt = {
        fontSize:'45px',
        lineHeight:'20px'
    }
    
    const handleGetStarted = () => {
        navigate('/signup')
    }
    
  return (
   <div style={body}>
    <div>
        <h1 style={headtxt}>Challenge Your Knowledge</h1>
        <h2>Learn Smarter. Play Harder.</h2>
        <p style={{color:'gray',marginRight:'700px'}}>A fun and interactive quiz app that lets you test your knowledge, challenge friends, and learn new things while playing. Track your progress, climb leaderboards, and make learning exciting!</p>
        <button 
            onClick={handleGetStarted}
            style={{backgroundColor:'blue',color:'white',padding:'15px 20px',borderRadius:'10px',borderStyle:'none',cursor:'pointer',fontSize:'15px',fontWeight:'600'}}
        >
            Get Started
        </button>
    </div>
   </div>
  )
}

export default Landingpage