const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    status: { type: String, enum: ['active', 'closed', 'waiting'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    closedAt: { type: Date }
});

module.exports = mongoose.model('Conversation', conversationSchema);