const express = require('express');
const router = express.Router();
const { getDailyPlan, updateDailyPlan } = require('../controllers/dailyPlanController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getDailyPlan)
    .post(protect, updateDailyPlan);

module.exports = router;
