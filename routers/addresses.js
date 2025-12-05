const express = require('express');
const addressController = require('../controllers/address');
const { auth } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/authorizeRoles');

const router = express.Router();

// Protected routes - User must be authenticated
router.get('/', auth, addressController.getAddressesByUserId);
router.post('/', auth, addressController.addAddress);
router.put('/:addressId', auth, addressController.updateAddress);
router.delete('/:addressId', auth, addressController.deleteAddress);
router.put('/:addressId/default', auth, addressController.setDefaultAddress);
router.get('/:addressId', auth, authorizeRoles('Admin'), addressController.getAddressById);

module.exports = router;
