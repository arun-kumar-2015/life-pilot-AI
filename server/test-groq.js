const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function main() {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'test' }],
            model: 'llama-3.1-8b-instant',
        });
        console.log('Success:', completion.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
