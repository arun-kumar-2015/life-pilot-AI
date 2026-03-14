const StudyPlan = require('../models/StudyPlan');
const Groq = require('groq-sdk');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get all study plans for a user
// @route   GET /api/study
// @access  Private
const getStudyPlans = async (req, res) => {
    try {
        const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new study plan (manual)
// @route   POST /api/study
// @access  Private
const createStudyPlan = async (req, res) => {
    const { subject, examDate, schedule } = req.body;

    try {
        const plan = new StudyPlan({
            userId: req.user._id,
            subject,
            examDate,
            schedule,
        });

        const savedPlan = await plan.save();
        res.status(201).json(savedPlan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Upload file and generate AI study plan
// @route   POST /api/study/upload
// @access  Private
const uploadAndGeneratePlan = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { subject, examDate } = req.body;
        const filePath = req.file.path;
        let extractedText = '';

        // Extract text based on file type
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({ data: dataBuffer });
            const data = await parser.getText();
            extractedText = data.text;
            await parser.destroy();
        } else {
            // Assume plain text
            extractedText = fs.readFileSync(filePath, 'utf8');
        }

        // Limit text size for AI processing
        const truncatedText = extractedText.substring(0, 5000);

        // Call Groq AI
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert Study Planner. Create a structured 3-day study schedule. \nCRITICAL: Return ONLY a valid JSON object with a 'schedule' key. \nEach day object must have 'day', 'date', and 'sessions' array. Each session MUST have 'period' (Morning/Afternoon/Evening), 'timeRange' (e.g. 09:00-09:30 AM), 'topic', and 'description'. Include scheduled breaks. \nExample: {\"schedule\": [{\"day\": 1, \"date\": \"...\", \"sessions\": [{\"period\": \"Morning\", \"timeRange\": \"09:00-09:30 AM\", \"topic\": \"...\", \"description\": \"...\"}]}]}"
                },
                {
                    role: "user",
                    content: `Create a study plan for correctly preparing for ${subject} with an exam on ${examDate}. Use the following material as the basis for topics:\n\n${truncatedText}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        let schedule;
        try {
            const content = completion.choices[0].message.content;
            const parsed = JSON.parse(content);
            schedule = parsed.schedule || parsed.days || parsed;
            if (!Array.isArray(schedule)) {
                // Try to find an array in the object
                schedule = Object.values(parsed).find(val => Array.isArray(val)) || content;
            }
        } catch (pErr) {
            console.error('AI JSON Parse Error:', pErr);
            schedule = completion.choices[0].message.content;
        }

        // Save to DB
        const plan = new StudyPlan({
            userId: req.user._id,
            subject,
            examDate,
            schedule,
        });

        const savedPlan = await plan.save();

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json(savedPlan);
    } catch (error) {
        console.error('File Upload/AI Error:', error);
        res.status(500).json({ message: 'Failed to process file and generate plan' });
    }
};

const deleteStudyPlan = async (req, res) => {
    try {
        const plan = await StudyPlan.findById(req.params.id);
        if (plan && plan.userId.toString() === req.user._id.toString()) {
            await plan.deleteOne();
            res.json({ message: 'Study plan removed' });
        } else {
            res.status(404).json({ message: 'Plan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudyPlans,
    createStudyPlan,
    uploadAndGeneratePlan,
    deleteStudyPlan,
};
