const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// @desc    Process AI requests using Groq
// @route   POST /api/ai/chat
// @access  Private
const processAIChat = async (req, res) => {
    const { prompt } = req.body;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are LifePilot AI, a personalized life manager. Help users with daily planning, productivity tips, study schedules, and goal setting. Provide structured and actionable responses. \n\nIMPORTANT: \n1. When asked to break down a goal, return a JSON object with a 'subtasks' key containing an array of strings. \n2. When asked to create a study schedule, return a JSON object with a 'schedule' key containing an array of daily objects. \nEach daily object must have: 'day' (number), 'date' (string), and 'sessions' (array of objects with 'period' (Morning/Afternoon/Evening), 'timeRange' (e.g., '9:00-9:30 AM'), 'topic', and 'description'). \nInclude 'Break' as a session if requested or appropriate. \nExample: {\"schedule\": [{\"day\": 1, \"date\": \"...\", \"sessions\": [{\"period\": \"Morning\", \"timeRange\": \"09:00-09:30 AM\", \"topic\": \"Warm-up\", \"description\": \"Quick review of basics\"}]}]}\n\nCRITICAL: Return ONLY the JSON object. No extra text."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Groq AI Processing Error:', error);
        res.status(500).json({ message: 'AI processing failed' });
    }
};

module.exports = {
    processAIChat,
};
