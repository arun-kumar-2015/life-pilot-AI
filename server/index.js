const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
const startServer = async () => {
    try {
        await connectDB();
        
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is missing in environment variables!');
        } else {
            console.log('DEBUG: JWT_SECRET is present');
        }
        
        // Middleware
        app.use(cors());
        app.use(express.json());
        
        // Basic Routes
        app.get('/', (req, res) => res.send('LifePilot AI API is running...'));
        app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                time: new Date().toISOString()
            });
        });
        
        // Routes
        app.use('/api/users', require('./routes/userRoutes'));
        app.use('/api/tasks', require('./routes/taskRoutes'));
        app.use('/api/expenses', require('./routes/expenseRoutes'));
        app.use('/api/goals', require('./routes/goalRoutes'));
        app.use('/api/study', require('./routes/studyRoutes'));
        app.use('/api/daily-plan', require('./routes/dailyPlanRoutes'));
        app.use('/api/ai', require('./routes/aiRoutes'));
        app.use('/api/notes', require('./routes/noteRoutes'));
        
        const PORT = process.env.PORT || 5000;
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Deployment sync: 2026-03-15-15-08