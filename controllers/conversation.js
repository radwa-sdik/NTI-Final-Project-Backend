const Conversation = require("../models/conversation");
const User = require("../models/users");

exports.startConversation = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Check if existing open conversation
        let convo = await Conversation.findOne({
            participants: userId,
            status: { $ne: "closed" }
        });

        if (!convo) {
            convo = await Conversation.create({
                participants: [userId]
            });
        }else if (req.user.role === "Admin" && !convo.participants.includes(userId)) {
            convo.participants.push(userId);
            await convo.save();
        }

        return res.status(200).json(convo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.closeConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        if (
        req.user.role !== "Admin" &&
        !conversation.participants.includes(req.user.userId)
        ) {
            return res.status(403).json({ error: "Not authorized" });
        }

        conversation.status = "closed";
        conversation.closedAt = new Date();
        await conversation.save();
        res.status(200).json({ message: "Conversation closed successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllConversationsForAdmin = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate("participants", "-password").sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
