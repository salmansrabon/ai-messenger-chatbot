const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sdetbotRoutes = require('./roadtosdet/chatbot.route.js');
const careerbotRoutes = require('./roadtocareer/chatbot.route.js');


app.use(bodyParser.json());
app.use('/roadtosdet', sdetbotRoutes);
app.use('/roadtocareer', careerbotRoutes);
module.exports = app;