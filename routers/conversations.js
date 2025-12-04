const express = require('express');
const conversationController = require('../controllers/conversation');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Protected routes - User must be authenticated
router.get('/', auth, conversationController.getConversationsByUserId);
router.post('/', auth, conversationController.createConversation);
router.post('/message', auth, conversationController.addMessage);
router.put('/read', auth, conversationController.markMessagesAsRead);
router.get('/unread/count', auth, conversationController.getUnreadMessageCount);

module.exports = router;
