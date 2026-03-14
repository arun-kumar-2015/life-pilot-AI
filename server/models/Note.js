const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        default: 'Neutral'
    },
    analysis: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
