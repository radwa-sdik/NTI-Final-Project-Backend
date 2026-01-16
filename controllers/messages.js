const Message = require("../models/messages");
const Conversation = require("../models/conversation");
const User = require("../models/users");

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user.userId;
        const senderType = req.user.role === "Admin" ? "Admin" : "User";

        if (!content?.trim()) {
            return res.status(400).json({ error: "Message content is required" });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const isParticipant = conversation.participants
            .some(id => id.toString() === senderId);
        // 🔒 Authorization check
        if (!isParticipant) {
            return res.status(403).json({ error: "Not allowed in this conversation" });
        }

        // Create message
        let msg = await Message.create({
            conversation: conversationId,
            sender: senderId,
            senderType,
            content
        });

        msg = await msg.populate("sender");

        // Update conversation timestamp
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Socket logic
        const io = req.io;
        const onlineUsers = req.onlineUsers;

        // Emit to all OTHER participants
        if(conversation.participants.length < 2)
            conversation.participants.push(senderId); // Ensure sender is included
        
        conversation.participants.forEach(participantId => {
            const socketId = onlineUsers.get(participantId.toString());
            if (socketId && participantId.toString() !== senderId) {
                io.to(socketId).emit("new-message", msg);
            }
        });

        res.status(201).json(msg);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send message" });
    }
};



exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender");

        res.status(200).json(messages);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const userId = req.user.userId;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const allowed = conversation.participants
          .some(id => id.toString() === userId);

        if (!allowed && req.user.role !== "Admin") {
            return res.status(403).json({ error: "Not authorized" });
        }

        await Message.updateMany(
            {
                conversation: conversationId,
                isRead: false,
                sender: { $ne: userId }
            },
            { $set: { isRead: true } }
        );

        res.json({ message: "Messages marked as read" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
