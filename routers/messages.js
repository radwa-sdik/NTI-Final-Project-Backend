const express = require("express");
const { sendMessage, getMessages, markAsRead } = require("../controllers/messages");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/:conversationId", auth, getMessages);
router.put("/:conversationId/read", auth, markAsRead);

module.exports = router;
