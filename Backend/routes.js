const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const collection = require('./Config');

// Authentication routes
router.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        console.log('Signup attempt for:', fullName, email);
        
        // Check if user already exists
        const existingUser = await collection.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name: fullName,
            email,
            password: hashedPassword,
        };

        const newUser = await collection.create(userData);
        console.log('User created successfully:', fullName);
        
        res.status(201).json({ 
            success: true,
            message: "User created successfully",
            user: { name: newUser.name, email: newUser.email }
        });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === 11000) { // Duplicate email
            res.status(400).json({ success: false, message: "Email already exists" });
        } else {
            res.status(500).json({ success: false, message: "Error creating user" });
        }
    }
});

router.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        
        // Find user by email
        const user = await collection.findOne({ email: email });
        
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        
        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
            console.log('Login successful for user:', user.name);
            res.status(200).json({ 
                success: true,
                message: "Login successful", 
                user: { name: user.name, email: user.email }
            });
        } else {
            console.log('Invalid password for user:', email);
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Test route to verify API is working
router.get('/api/test', (req, res) => {
    res.status(200).json({ 
        success: true,
        message: "API is working correctly" 
    });
});

module.exports = router;