const mongoose = require('mongoose');

const dailyPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    items: [
        {
            time: String,
            activity: String,
            icon: String
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);
