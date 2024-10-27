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

                    Evaluate the student's answer based on the following scoring rules:
                    1. If the answer is completely incorrect or irrelevant, give a score of 0.
                    2. If the answer is 90-100% correct (almost identical to the expected answer in terms of meaning and relevance), give full marks (${pointsPerQuestion}).
                    3. If the answer is 70-80% correct (mostly correct but missing minor details), give a score of 8 or 9.
                    4. If the answer is 50-69% correct (has some correct elements but is missing major parts), give a score between 5 and 7.
                    5. If the answer is less than 50% correct, give a score between 1 and 4 based on its accuracy.

                    Provide your evaluation reasoning and the score directly in the following JSON format:
                    {
                        "evaluation": "<Your detailed evaluation here>",
                        "score": <score>
                    }
                    Ensure the score is a number between 0 and ${pointsPerQuestion}.
                ` }
            ]
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        // Parse the structured JSON response
        const evaluationResponse = JSON.parse(response.data.choices[0].message.content);

        res.json({
            evaluation: evaluationResponse.evaluation,
            score: evaluationResponse.score
        });
    } catch (error) {
        console.error('Error evaluating answer:', error.message);
        res.status(500).json({ error: 'Error evaluating answer' });
    }
};

module.exports = { evaluateAnswer };


