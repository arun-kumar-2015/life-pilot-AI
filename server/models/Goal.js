const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goalTitle: {
        type: String,
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    targetDate: {
        type: Date
    },
    subTasks: [{
        title: String,
        completed: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
