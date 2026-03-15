const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Middleware - Apply FIRST
app.use(cors());
app.use(express.json());

// Basic Routes
app.get('/', (req, res) => res.send('LifePilot AI API is running...'));
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: mongoose.connection && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        time: new Date().toISOString()
    });
});

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));
app.use('/api/daily-plan', require('./routes/dailyPlanRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));

// Start Server - Bind Port IMMEDIATELY for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Connect to Database after binding to port to avoid Render timeout
    connectDB().then(() => {
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is missing in environment variables!');
        } else {
            console.log('DEBUG: DB Connected & JWT_SECRET is ready');
        }
    }).catch(err => {
        console.error('Initial DB connection background failure:', err);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Deployment sync: 2026-03-15-16-52