const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    examDate: {
        type: Date
    },
    schedule: {
        type: mongoose.Schema.Types.Mixed // JSON structure for the schedule
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
