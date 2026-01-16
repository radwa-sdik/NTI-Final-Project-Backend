const express = require('express');
const conversationController = require('../controllers/conversation');
const { auth } = require('../middlewares/auth');
const {authorizeRoles} = require("../middlewares/authorizeRoles");
const router = express.Router();

router.post("/start", auth, conversationController.startConversation);
router.put("/close/:conversationId", auth, conversationController.closeConversation);
router.get("/all", auth, authorizeRoles("Admin"), conversationController.getAllConversationsForAdmin);
router.get("/", auth, conversationController.getUserConversations);

module.exports = router;
