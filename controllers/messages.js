const Message = require("../models/messages");
const Conversation = require("../models/conversation");
const User = require("../models/users");

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const sender = req.user.userId;
        const senderType = req.user.role === "Admin" ? "Admin" : "User";

        // Create new message
        let msg = await Message.create({
            conversation: conversationId,
            sender,
            senderType,
            content
        });

        // Populate sender for frontend UI
        msg = await Message.findById(msg._id).populate("sender");

        // Update conversation timestamp
        await Conversation.findByIdAndUpdate(conversationId, {
            updatedAt: Date.now()
        });

        // Emit via sockets
        const io = req.io;
        const onlineUsers = req.onlineUsers;

        if (senderType === "User") {
            // Send to ALL admins
            io.emit("admin-new-message", msg);

        } else {
            // Find the user participant
            const conversation = await Conversation.findById(conversationId);
            const userId = conversation.participants[0].toString();

            const userSocket = onlineUsers.get(userId);
            if (userSocket) {
                io.to(userSocket).emit("user-new-message", msg);
            }
        }

        res.status(201).json(msg);

    } catch (err) {
        res.status(500).json({ error: err.message });
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

        await Message.updateMany(
            { conversation: conversationId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: "Messages marked as read" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
