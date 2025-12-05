const addressModel = require('../models/address');
const userModel = require('../models/users');

// Add a new address for a user
exports.addAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { street, city, zipCode, country, isDefault } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const address = new addressModel({
            userId,
            street,
            city,
            zipCode,
            country,
            isDefault
        });
        await address.save();
        res.status(201).json(address);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all addresses for a user
exports.getAddressesByUserId = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addresses = await addressModel.find({ userId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Set an address as default for a user
exports.setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.addressId;
        await addressModel.updateMany({ userId }, { isDefault: false });
        await addressModel.findByIdAndUpdate(addressId, { isDefault: true });
        res.status(200).json({ message: 'Default address updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete an address for a user
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        await addressModel.findByIdAndDelete(addressId);
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update an address for a user
exports.updateAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const { street, city, zipCode, country, isDefault } = req.body;
        const updatedAddress = await addressModel.findByIdAndUpdate(
            addressId,
            { street, city, zipCode, country, isDefault },
            { new: true }
        );
        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getAddressById = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const address = await addressModel.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};