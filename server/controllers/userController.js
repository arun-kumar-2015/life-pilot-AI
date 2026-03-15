const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    console.time('Registration Process');
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ message: 'Please provide all fields' });
            return;
        }

        console.time('DB: Find User');
        const userExists = await User.findOne({ email }).lean();
        console.timeEnd('DB: Find User');

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        console.time('DB: Create User');
        const user = await User.create({
            name,
            email,
            password,
        });
        console.timeEnd('DB: Create User');

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ 
            message: 'Server Error during registration', 
            error: error.message 
        });
    } finally {
        console.timeEnd('Registration Process');
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    console.time('Login Process');
    const { email, password } = req.body;

    console.time('DB: Find User (Login)');
    const user = await User.findOne({ email }).lean(); 
    console.timeEnd('DB: Find User (Login)');

    if (user) {
        console.time('CPU: Password Compare');
        const isMatch = await bcrypt.compare(password, user.password);
        console.timeEnd('CPU: Password Compare');

        if (isMatch) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
            console.timeEnd('Login Process');
            return;
        }
    }
    
    res.status(401).json({ message: 'Invalid email or password' });
    console.timeEnd('Login Process');
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
};
