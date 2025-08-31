// controllers/messengerController.js
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "1234";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // required
const FB_API = "https://graph.facebook.com/v21.0/me/messages";

// GET /webhook — Facebook verification
const verifyWebhook = (req, res) => {
  console.log('Webhook verification request received');
  console.log('Query params:', req.query);
  
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(`Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);
  console.log(`Expected token: ${VERIFY_TOKEN}`);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log('Verification successful, sending challenge');
    return res.status(200).send(challenge);
  }
  console.log('Verification failed');
  return res.sendStatus(403);
};

// POST /webhook — Messenger events
const handleWebhook = async (req, res) => {
  try {
    const body = req.body;
    if (body.object === "page") {
      for (const entry of body.entry ?? []) {
        for (const event of entry.messaging ?? []) {
          const senderId = event?.sender?.id;
          const messageText = event?.message?.text;

          if (senderId && messageText) {
            const reply = await processMessage(messageText);
            await sendMessageToMessenger(senderId, reply);
          }
        }
      }
      return res.sendStatus(200); // acknowledge receipt
    }

    return res.sendStatus(404);
  } catch (err) {
    console.error("Webhook handling error:", err?.response?.data || err.message);
    return res.sendStatus(500);
  }
};

// ----- helpers -----
async function processMessage(message) {
  try {
    // Instead of making HTTP call to self, directly import and use chatbot controller
    const { chatBotResponse } = require("./chatbot.controller.js");
    
    // Create a mock request/response to use the existing chatbot function
    const mockReq = { body: { question: message } };
    let responseData = null;
    
    const mockRes = {
      status: () => ({ json: (data) => { responseData = data; } }),
      json: (data) => { responseData = data; }
    };
    
    await chatBotResponse(mockReq, mockRes);
    
    if (responseData && typeof responseData.message === "string" && responseData.message.trim().length) {
      return responseData.message;
    }
    return "Unexpected response from API";
  } catch (err) {
    console.error("processMessage error:", err?.response?.data || err.message);
    return "An error occurred while processing your request. Please try again.";
  }
}

module.exports = {
  verifyWebhook,
  handleWebhook,
};

async function sendMessageToMessenger(recipientId, messageText) {
  try {
    if (!PAGE_ACCESS_TOKEN) {
      console.error("Missing PAGE_ACCESS_TOKEN");
      return;
    }

    const payload = {
      recipient: { id: recipientId },
      message: { text: messageText },
    };

    // Use Authorization header instead of query parameter to match your working curl
    await axios.post(
      FB_API,
      payload,
      { 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${PAGE_ACCESS_TOKEN}`
        }, 
        timeout: 15000 
      }
    );
  } catch (err) {
    console.error(
      "sendMessageToMessenger error:",
      err?.response?.data || err.message
    );
  }
}
