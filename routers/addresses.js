const express = require('express');
const addressController = require('../controllers/address');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Protected routes - User must be authenticated
router.get('/', auth, addressController.getAddressesByUserId);
router.post('/', auth, addressController.addAddress);
router.put('/:addressId', auth, addressController.updateAddress);
router.delete('/:addressId', auth, addressController.deleteAddress);
router.put('/:addressId/default', auth, addressController.setDefaultAddress);

module.exports = router;
