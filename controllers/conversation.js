const conversationModel = require('../models/conversation');
const messageModel = require('../models/messages');
// Create a new conversation
exports.createConversation = async (req, res) => {
    try {
        const { participants } = req.body;
        const newConversation = new conversationModel({ participants });
        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get conversations for a user
exports.getConversationsByUserId = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await conversationModel.find({ participants: userId }).populate('participants', 'username email');
        const conversationsWithMessages = await Promise.all(conversations.map(async (conversation) => {
            const messages = await messageModel.find({ conversationId: conversation._id });
            return { ...conversation.toObject(), messages };
        }));
        res.status(200).json(conversationsWithMessages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a message to a conversation
exports.addMessage = async (req, res) => {
    try {
        const sender = req.user.userId;
        const senderType = req.user.role;
        const { conversationId, content } = req.body;
        const newMessage = new messageModel({ conversation: conversationId, sender, senderType, content });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user.userId;
        await messageModel.updateMany(
            { conversation: conversationId, sender: { $ne: userId }, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread message count for a user
exports.getUnreadMessageCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await conversationModel.find({ participants: userId });
        let unreadCount = 0;
        for (const conversation of conversations) {
            const count = await messageModel.countDocuments({ conversation: conversation._id, sender: { $ne: userId }, isRead: false });
            unreadCount += count;
        }
        res.status(200).json({ unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};