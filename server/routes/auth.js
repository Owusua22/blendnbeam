const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers
} = require('../controllers/authController');

const { protect, admin } = require('../middleware/authMiddleware');

// ---------------------------
// AUTH ROUTES
// ---------------------------

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// ---------------------------
// USER PROFILE
// ---------------------------

// Get logged-in user profile
router.get('/profile', protect, getProfile);

// Update logged-in user profile
router.put('/profile', protect, updateProfile);

// ---------------------------
// ADMIN ROUTES
// ---------------------------

// Fetch all users (Admin only)
router.get('/', protect, admin, getAllUsers);

module.exports = router;
