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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow React frontend (Vite uses 5173 by default)
  credentials: true
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