const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('DEBUG: MONGODB_URI is MISSING in process.env');
            throw new Error('MONGODB_URI is not defined in environment variables');
        } else {
            console.log('DEBUG: MONGODB_URI is present (length:', process.env.MONGODB_URI.length, ')');
        }
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // Increased to 10s
            socketTimeoutMS: 45000,
        };
        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
};

module.exports = connectDB;
