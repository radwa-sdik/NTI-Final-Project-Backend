const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}],
    messages: [{
        sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        senderType: {type: String, enum: ['User', 'Admin', 'Agent'], required: true},
        content: {type: String, required: true},
        timestamp: {type: Date, default: Date.now},
        isRead: {type: Boolean, default: false}
    }],
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('Conversation', conversationSchema);