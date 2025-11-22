import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Brain, Award, Zap, Users, BookOpen, ChevronRight, MessageCircle } from 'lucide-react';

const Landingpage = () => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const handleGetStarted = () => {
        navigate('/signup');
    };
    
    const features = [
        {
            icon: <Brain size={24} color="#4f46e5" />,
            title: "Knowledge Challenges",
            description: "Test yourself with thousands of questions across various categories and difficulty levels."
        },
        {
            icon: <Users size={24} color="#4f46e5" />,
            title: "Challenge Friends",
            description: "Invite friends to compete in real-time multiplayer quiz battles."
        },
        {
            icon: <Award size={24} color="#4f46e5" />,
            title: "Leaderboards",
            description: "Track your progress and compete with others on global and friend leaderboards."
        },
        {
            icon: <Zap size={24} color="#4f46e5" />,
            title: "Daily Quizzes",
            description: "New content daily to keep your knowledge fresh and expanding."
        },
    ];
    
    

    
   
    const styles = {
        
        container: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#1e293b',
            overflowX: 'hidden',
            width: '100%'
        },
        
        // Hero section
        hero: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '2rem 1.5rem' : '4rem 5rem',
            background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)',
            minHeight: isMobile ? '60vh' : '85vh',
            position: 'relative',
            overflow: 'hidden'
        },
        heroContent: {
            maxWidth: isMobile ? '100%' : '600px',
            zIndex: 2,
        },
        heroTitle: {
            fontSize: isMobile ? '2.25rem' : '3.5rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            background: 'linear-gradient(to right, #1e40af, #4f46e5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        heroSubtitle: {
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: '600',
            color: '#475569',
            marginBottom: '1.5rem'
        },
        heroParagraph: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: 1.7,
            maxWidth: '85%'
        },
        ctaButton: {
            background: 'linear-gradient(to right, #4f46e5, #6366f1)',
            color: 'white',
            padding: '0.875rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        heroImage: {
            width: isMobile ? '100%' : '45%',
            marginTop: isMobile ? '2rem' : 0,
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        quizIllustration: {
            maxWidth: '100%',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        
        
        featuresSection: {
            padding: isMobile ? '3rem 1.5rem' : '5rem',
            background: '#ffffff'
        },
        sectionTitle: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '0.5rem',
            color: '#1e293b'
        },
        sectionSubtitle: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem'
        },
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        featureCard: {
            background: '#f8fafc',
            borderRadius: '1rem',
            padding: '2rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid #e2e8f0',
            height: '100%'
        },
        featureIcon: {
            background: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '0.5rem',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
        },
        featureTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: '#1e293b'
        },
        featureDescription: {
            fontSize: '0.95rem',
            color: '#64748b',
            lineHeight: 1.7
        },
        
        // How it works section
        howItWorksSection: {
            padding: isMobile ? '3rem 1.5rem' : '5rem',
            background: '#f1f5f9'
        },
        stepsContainer: {
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        },
        step: {
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '1.5rem',
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            flexDirection: isMobile ? 'column' : 'row'
        },
        stepNumber: {
            background: '#4f46e5',
            color: 'white',
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontWeight: '700',
            fontSize: '1.25rem',
            flexShrink: 0
        },
        stepContent: {
            flex: 1
        },
        stepTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1e293b'
        },
        stepDescription: {
            fontSize: '0.95rem',
            color: '#64748b',
            lineHeight: 1.7
        },
        
        // Testimonials section
        testimonialsSection: {
            padding: isMobile ? '3rem 1.5rem' : '5rem',
            background: '#ffffff'
        },
        testimonialGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        testimonialCard: {
            background: '#f8fafc',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        quoteIcon: {
            color: '#4f46e5',
            marginBottom: '1rem',
            alignSelf: 'flex-start'
        },
        quote: {
            fontSize: '1rem',
            color: '#334155',
            lineHeight: 1.7,
            marginBottom: '1.5rem',
            flex: 1
        },
        author: {
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1e293b'
        },
        role: {
            fontSize: '0.875rem',
            color: '#64748b'
        },
        
        // Call to action section
        ctaSection: {
            padding: isMobile ? '3rem 1.5rem' : '5rem',
            background: 'linear-gradient(to right, #4f46e5, #6366f1)',
            textAlign: 'center',
            color: 'white'
        },
        ctaTitle: {
            fontSize: isMobile ? '1.75rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem'
        },
        ctaDescription: {
            fontSize: isMobile ? '0.95rem' : '1.125rem',
            opacity: 0.9,
            marginBottom: '2rem',
            maxWidth: '700px',
            margin: '0 auto 2rem'
        },
        ctaButtonInverse: {
            background: 'white',
            color: '#4f46e5',
            padding: '0.875rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        
        // Footer
        footer: {
            background: '#1e293b',
            color: 'white',
            padding: isMobile ? '2.5rem 1.5rem' : '4rem 5rem',
        },
        footerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '2rem'
        },
        footerLogo: {
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem'
        },
        footerDescription: {
            fontSize: '0.875rem',
            color: '#cbd5e1',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
            maxWidth: '25ch'
        },
        footerLinks: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        footerLink: {
            marginBottom: '0.75rem'
        },
        footerLinkText: {
            color: '#cbd5e1',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.2s',
            cursor: 'pointer'
        },
        footerHeading: {
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1.25rem',
            color: 'white'
        },
        copyright: {
            borderTop: '1px solid #334155',
            marginTop: '3rem',
            paddingTop: '2rem',
            fontSize: '0.875rem',
            color: '#94a3b8',
            textAlign: 'center'
        }
    };
    
    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Challenge Your Knowledge</h1>
                    <h2 style={styles.heroSubtitle}>Learn Smarter. Play Harder.</h2>
                    <p style={styles.heroParagraph}>
                        A fun and interactive quiz app that lets you test your knowledge, challenge friends, 
                        and learn new things while playing. Track your progress, climb leaderboards, and make learning exciting!
                    </p>
                    <button 
                        onClick={handleGetStarted}
                        style={styles.ctaButton}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 15px 20px -5px rgba(79, 70, 229, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3)';
                        }}
                    >
                        Get Started <ChevronRight size={18} />
                    </button>
                </div>
                <div style={styles.heroImage}>
                    <img 
                        src="/quiz-img1.png"
                        alt="Quiz Force Illustration" 
                        style={styles.quizIllustration}
                    />
                </div>
            </section>
            
            {/* Features Section */}
            <section style={styles.featuresSection}>
                <h2 style={styles.sectionTitle}>Key Features</h2>
                <p style={styles.sectionSubtitle}>
                    Quiz Force offers a variety of features designed to make learning engaging and effective.
                </p>
                <div style={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            style={styles.featureCard}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-5px)';
                                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <div style={styles.featureIcon}>{feature.icon}</div>
                            <h3 style={styles.featureTitle}>{feature.title}</h3>
                            <p style={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* How it Works Section */}
            <section style={styles.howItWorksSection}>
                <h2 style={styles.sectionTitle}>How It Works</h2>
                <p style={styles.sectionSubtitle}>
                    Get started with Quiz Force in just a few simple steps
                </p>
                <div style={styles.stepsContainer}>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>1</div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Create Your Account</h3>
                            <p style={styles.stepDescription}>
                                Sign up for a free account to get started and access all features.
                            </p>
                        </div>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>2</div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Choose Your Quiz</h3>
                            <p style={styles.stepDescription}>
                                Select from thousands of quizzes across various categories and difficulty levels.
                            </p>
                        </div>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>3</div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Challenge Yourself</h3>
                            <p style={styles.stepDescription}>
                                Take quizzes, earn points, track your progress, and compete with friends.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        
            
            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <h2 style={styles.ctaTitle}>Ready to Test Your Knowledge?</h2>
                <p style={styles.ctaDescription}>
                    Join thousands of users who are already learning and having fun with Quiz Force.
                </p>
                <button 
                    onClick={handleGetStarted}
                    style={styles.ctaButtonInverse}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 15px 20px -5px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    Get Started Now <ChevronRight size={18} />
                </button>
            </section>
            
            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <div>
                        <h3 style={styles.footerLogo}>Quiz Force</h3>
                        <p style={styles.footerDescription}>
                            Making learning fun and interactive through engaging quizzes.
                        </p>
                    </div>
                    <div>
                        <h4 style={styles.footerHeading}>Explore</h4>
                        <ul style={styles.footerLinks}>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>Features</span>
                            </li>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>How It Works</span>
                            </li>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>Pricing</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={styles.footerHeading}>Resources</h4>
                        <ul style={styles.footerLinks}>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>Help Center</span>
                            </li>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>Blog</span>
                            </li>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>FAQs</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={styles.footerHeading}>Contact</h4>
                        <ul style={styles.footerLinks}>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>support@quizforce.com</span>
                            </li>
                            <li style={styles.footerLink}>
                                <span style={styles.footerLinkText}>+1 (555) 123-4567</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div style={styles.copyright}>
                    © {new Date().getFullYear()} Quiz Force. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landingpage;