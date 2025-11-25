const moongoose = require('mongoose');
const { use } = require('react');

const addressSchema = new moongoose.Schema({
    userId: { type: moongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: String,
    street: String,
    city: String,
    country: String,
    zip: String,
    isDefault: { type: Boolean, default: false }
});

module.exports = moongoose.model('Address', addressSchema);