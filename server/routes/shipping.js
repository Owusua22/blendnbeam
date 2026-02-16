const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// Replace these with your project's actual auth middleware.
// If you already have protect/admin middleware, import them instead:
// const { protect, admin } = require('../middleware/authMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: list shipping zones (optionally filter ?active=true)
router.get('/', shippingController.getAllShipping);

// Public: get single shipping zone
router.get('/:id', shippingController.getShippingById);

// Admin: create a shipping zone
router.post('/', protect, admin, shippingController.createShipping);

// Admin: update shipping zone
router.put('/:id', protect, admin, shippingController.updateShipping);

// Admin: delete shipping zone
router.delete('/:id', protect, admin, shippingController.deleteShipping);

module.exports = router;