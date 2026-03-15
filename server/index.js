const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Request Logger - CRITICAL for debugging production
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'N/A'}`);
    next();
});

// Manual CORS Middleware - Replaces 'cors' package for absolute reliability
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());

// Basic Routes
app.get('/', (req, res) => res.send('LifePilot AI API is running...'));

// Enhanced Health Check
app.get('/api/health', (req, res) => {
    const readyState = mongoose.connection ? mongoose.connection.readyState : -1;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
        '-1': 'uninitialized'
    };
    
    res.json({ 
        status: 'ok', 
        database: states[readyState] || 'unknown',
        readyState: readyState,
        env: {
            has_mongo: !!process.env.MONGODB_URI,
            has_jwt: !!process.env.JWT_SECRET,
            port: process.env.PORT || 5000
        },
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

// Start Server - Bind Port IMMEDIATELY for Render Stability
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} - Waiting for DB...`);
    
    // Connect to Database after binding to port
    connectDB().then(() => {
        console.log('DB Connection Promise Resolved');
    }).catch(err => {
        console.error('CRITICAL: DB Connection Failed in background:', err);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Final Stability Build: 2026-03-15-18-51