const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./Config');
const routes = require('./routes');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// CORS configuration for Google FedCM and frontend
app.use(cors({
  // Allow requests from frontend and Google OAuth domains
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:3000',
      // Google OAuth/FedCM domains (critical for FedCM)
      'https://accounts.google.com',
      'https://www.googleapis.com',
      'https://gstatic.com',
      'https://content-autofill.googleapis.com'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive in development
    }
  },
  // Required for cookies and authentication tokens
  credentials: true,
  // Explicitly allow all necessary HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  // FedCM requires these headers for credential exchange
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  // Expose headers that frontend might need
  exposedHeaders: ['Set-Cookie'],
  // Cache preflight requests for 24 hours
  maxAge: 86400,
  // Handle OPTIONS preflight
  preflightContinue: false,
  optionsSuccessStatus: 204
}));


connectDB();

// Use API routes
app.use('/', routes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    time: new Date().toISOString()
  });
});


app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});