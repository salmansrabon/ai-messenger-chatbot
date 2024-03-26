const { OpenAI } = require("openai");
const fs = require('fs').promises;
require('dotenv').config();

const botConfig={
    name:"Career Bot",
    dataFile:"./roadtocareer/data.txt"
}

const chatBotResponse=async (req, res)=>{
    const { question } = req.body;
    const story = await loadStory(botConfig.dataFile);
    const answer = await getAnswerFromGPT(question, story);
    console.log(`${answer}\n`);
    res.status(200).json({
        message: answer
    });
}

const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function loadStory(filename) {
    return fs.readFile(filename, { encoding: 'utf8' });
}

async function getAnswerFromGPT(question, story) {
    const prompt = `The following information is provided about the business:\n${story}\n\nQuestion: ${question}\nAnswer:`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "system", "content": "You are a knowledgeable assistant named "+botConfig.name+" who provides information based on the provided business narrative. Your responses should be from the perspective of the provided business representative. However, if someone asks you in Bengali, you will respond in the English language." },
                { "role": "user", "content": prompt }
            ],
            temperature: 0.5,
            max_tokens: 4096,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
        });
        const lastMessage = response.choices[0].message.content.trim()
        return lastMessage;
    } catch (e) {
        console.error(`An error occurred: ${e.response?.data?.error?.message || e.message}`);
        return `An error occurred: ${e.response?.data?.error?.message || e.message}`;
    }
}

module.exports = { chatBotResponse }
