const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Connect to Database after binding to port
    connectDB().then(() => {
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is missing in environment variables!');
        } else {
            console.log('DEBUG: JWT_SECRET is present');
        }
    }).catch(err => {
        console.error('Initial DB connection failed:', err);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Deployment sync: 2026-03-15-15-08