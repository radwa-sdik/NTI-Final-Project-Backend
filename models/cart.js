const mongoose = require('mongoose');
const { create } = require('./products');
const cartSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    items: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        quantity: {type: Number, default: 1},
        priceBerUnit: {type: Number, required: true}
    }],
    createdAt: {type: Date, default: Date.now}
});

cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((total, item) => total + item.quantity * item.priceBerUnit, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('Cart', cartSchema);