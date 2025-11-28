const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const UserModel = require('../models/users');
require('dotenv').config();

exports.createUser = async (req, res) => {
    const { firstName, lastName, phone, password, email, role } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            firstName,
            lastName,
            phone,
            password: hashedPassword,
            email,
            role
        });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: "Login successful", "Token": token  });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

