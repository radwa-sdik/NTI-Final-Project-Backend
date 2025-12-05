const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    addressId: {type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true},
    products: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        quantity: {type: Number, default: 1},
        price: {type: Number, required: true}
    }],
    subTotal: {type: Number, required: true},
    totalPrice: {type: Number, required: true},
    tax: {type: Number},
    shipping: {type: Number},
    status: {type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending'},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Order', orderSchema);