const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ------------------------
// Orders CRUD & Lifecycle
// ------------------------

// Create new order
router.route('/').post(protect, createOrder);

// Get all orders (Admin only)
router.route('/').get(protect, admin, getAllOrders);

// Get logged-in user's orders
router.route('/myorders').get(protect, getUserOrders);

// Get specific order by ID
router.route('/:id').get(protect, getOrderById);

// Update order to PAID
router.route('/:id/pay').put(protect, updateOrderToPaid);

// Update order status (Admin only)
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;
