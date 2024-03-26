const express = require('express');
const { chatBotResponse } = require('./chatbot.controller.js');

const router = express.Router();

router.post("/chat", chatBotResponse);
module.exports = router;