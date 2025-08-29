// routes/webhookRoutes.js
const { Router } = require("express");
const { verifyWebhook, handleWebhook } = require("./messenger.controller.js");

const router = Router();

// Mounted at /webhook in app.js
router.get("/", verifyWebhook);
router.post("/", handleWebhook);

module.exports = router;
