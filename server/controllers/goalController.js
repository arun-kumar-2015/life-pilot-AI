const Goal = require('../models/Goal');

// @desc    Get all goals for a user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
    const { goalTitle, targetDate, subTasks } = req.body;

    try {
        const goal = new Goal({
            userId: req.user._id,
            goalTitle,
            targetDate,
            subTasks,
        });

        const savedGoal = await goal.save();
        res.status(201).json(savedGoal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (goal && goal.userId.toString() === req.user._id.toString()) {
            goal.goalTitle = req.body.goalTitle || goal.goalTitle;
            goal.progress = req.body.progress !== undefined ? req.body.progress : goal.progress;
            goal.targetDate = req.body.targetDate || goal.targetDate;
            goal.subTasks = req.body.subTasks || goal.subTasks;

            const updatedGoal = await goal.save();
            res.json(updatedGoal);
        } else {
            res.status(404).json({ message: 'Goal not found or unauthorized' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (goal && goal.userId.toString() === req.user._id.toString()) {
            await goal.deleteOne();
            res.json({ message: 'Goal removed' });
        } else {
            res.status(404).json({ message: 'Goal not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
};
