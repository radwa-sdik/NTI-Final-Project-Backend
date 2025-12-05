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
        }

        return res.status(200).json(convo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllConversationsForAdmin = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate("participants", "-password");

        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
