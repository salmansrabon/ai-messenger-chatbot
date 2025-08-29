// controllers/messengerController.js
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "1234";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // required
const FB_API = "https://graph.facebook.com/v13.0/me/messages";

// GET /webhook — Facebook verification
const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
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
    const apiUrl = `${process.env.PORT}/roadtosdet/chat`;
    const { data } = await axios.post(
      apiUrl,
      { question: message },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (data && typeof data.message === "string" && data.message.trim().length) {
      return data.message;
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

    await axios.post(
      `${FB_API}?access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`,
      payload,
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );
  } catch (err) {
    console.error(
      "sendMessageToMessenger error:",
      err?.response?.data || err.message
    );
  }
}
