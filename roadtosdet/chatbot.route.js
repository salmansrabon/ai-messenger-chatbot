const express = require('express');
const { chatBotResponse } = require('./chatbot.controller.js');
const { evaluateAnswer } = require('./evaluation.controller.js');

const router = express.Router();

router.post("/chat", chatBotResponse);
router.post('/evaluate', evaluateAnswer);

module.exports = router;