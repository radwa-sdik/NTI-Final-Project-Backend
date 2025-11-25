const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    phone: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['User', 'Admin', 'Agent'], default: 'User' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);
