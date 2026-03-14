const DailyPlan = require('../models/DailyPlan');

// @desc    Get today's daily plan
// @route   GET /api/daily-plan
// @access  Private
const getDailyPlan = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);

        const plan = await DailyPlan.findOne({
            userId: req.user._id,
            date: { $gte: today, $lt: nextDay }
        });

        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update today's daily plan
// @route   POST /api/daily-plan
// @access  Private
const updateDailyPlan = async (req, res) => {
    const { items } = req.body;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);

        let plan = await DailyPlan.findOne({
            userId: req.user._id,
            date: { $gte: today, $lt: nextDay }
        });

        if (plan) {
            plan.items = items;
            const updatedPlan = await plan.save();
            res.json(updatedPlan);
        } else {
            const newPlan = new DailyPlan({
                userId: req.user._id,
                date: today,
                items
            });
            const savedPlan = await newPlan.save();
            res.status(201).json(savedPlan);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getDailyPlan,
    updateDailyPlan,
};
