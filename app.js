const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// CORS MUST come before routes
app.use(cors({
  origin: ['http://localhost:3000', 'https://roadtocareer.net'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

const sdetbotRoutes = require('./roadtosdet/chatbot.route.js');
const careerbotRoutes = require('./roadtocareer/chatbot.route.js');

app.use('/roadtosdet', sdetbotRoutes);
app.use('/roadtocareer', careerbotRoutes);

module.exports = app;
