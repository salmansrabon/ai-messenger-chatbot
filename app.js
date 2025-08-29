const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const sdetbotRoutes = require('./roadtosdet/chatbot.route.js');

// CORS MUST come before routes
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://roadtocareer.net'],
//   methods: ['GET', 'POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));
app.use(cors({
    origin: '*'
}));

app.use(bodyParser.json());

app.use('/roadtosdet', sdetbotRoutes);

module.exports = app;
