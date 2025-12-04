const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    street: {type: String, required: true},
    city: {type: String, required: true},
    zipCode: {type: String, required: true},
    country: {type: String, required: true},
    isDefault: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('Address', addressSchema);