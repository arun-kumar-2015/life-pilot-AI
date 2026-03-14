const Note = require('../models/Note');
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { content, mood } = req.body;

    try {
        // AI Analysis
        let analysis = '';
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a supportive and empathetic life coach. Analyze the user's thought/feeling (given in content) and provide a short (1-2 sentences), encouraging, and insightful response. Focus on emotional support and constructive perspective."
                    },
                    {
                        role: "user",
                        content: `Mood: ${mood}. Content: ${content}`
                    }
                ],
                model: "llama-3.3-70b-versatile",
            });
            analysis = completion.choices[0]?.message?.content || "";
        } catch (aiErr) {
            console.error('AI Analysis failed:', aiErr);
            analysis = "I'm here for you. Keep reflecting and growing.";
        }

        const note = new Note({
            userId: req.user._id,
            content,
            mood,
            analysis
        });

        const savedNote = await note.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note && note.userId.toString() === req.user._id.toString()) {
            await note.deleteOne();
            res.json({ message: 'Note removed' });
        } else {
            res.status(404).json({ message: 'Note not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotes,
    createNote,
    deleteNote
};
