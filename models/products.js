const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String},
    productImages: [{
        imageUrl: {type: String, required: true},
        isMain: {type: Boolean, default: false}
    }],
    quantity: {type: Number, default: 0, min: 0},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true}
});

// virtual field computed from quantity
productSchema.virtual("inStock").get(function () {
    return this.quantity > 0;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });
module.exports = mongoose.model('Product', productSchema);