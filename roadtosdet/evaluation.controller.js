// controllers/evaluationController.js
const axios = require('axios');

const evaluateAnswer = async (req, res) => {
    const { studentAnswer, expectedAnswer, pointsPerQuestion } = req.body;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an evaluator for student answers based on the given criteria." },
                { role: "user", content: `
                    The expected answer is: "${expectedAnswer}".
                    The student's answer is: "${studentAnswer}".
                    The total points available for this question is ${pointsPerQuestion}.
                    Evaluate the student's answer and suggest a score out of ${pointsPerQuestion} based on its correctness, completeness, and relevance to the expected answer.
                    Provide your evaluation reasoning and the suggested score.
                ` }
            ]
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        const evaluation = response.data.choices[0].message.content;
        const score = parseScore(evaluation);

        res.json({ evaluation, score });
    } catch (error) {
        res.status(500).json({ error: 'Error evaluating answer' });
    }
};

function parseScore(evaluation) {
    const scorePattern = /score of (\d+)\s*\/\s*(\d+)/i;
    const match = evaluation.match(scorePattern);
    if (match) {
        return {
            score: parseInt(match[1], 10),
            maxPoints: parseInt(match[2], 10)
        };
    } else {
        return { score: 0, maxPoints: 0 };
    }
}

module.exports = { evaluateAnswer };
