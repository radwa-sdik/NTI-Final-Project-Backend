const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},
    amount: {type: Number, required: true},
    method: {type: String, enum: ['Credit Card', 'PayPal', 'Bank Transfer'], required: true},
    status: {type: String, default: 'Pending'},
    transactionId: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});
module.exports = mongoose.model('Payment', paymentSchema);