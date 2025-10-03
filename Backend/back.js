const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./Config');
const routes = require('./routes');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow React frontend (Vite uses 5173 by default)
  credentials: true
}));

// Connect to MongoDB
connectDB();

// Use API routes
app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    time: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});