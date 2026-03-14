const express = require('express');
const router = express.Router();
const { processAIChat } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/chat', protect, processAIChat);

module.exports = router;
