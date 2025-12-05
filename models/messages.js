const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderType: { type: String, enum: ['User', 'Admin', 'Agent'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);
