const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  registerAdmin,
  adminLogin,
} = require('../controllers/authController');

const { protect, admin } = require('../middleware/authMiddleware');


router.post("/register", register);
router.post("/login", login);

// admin routes
router.post("/admin/register", registerAdmin);
router.post("/admin/login", adminLogin);



// ---------------------------
// USER PROFILE
// ---------------------------

// Get logged-in user profile
router.get('/profile', protect, getProfile);

// Update logged-in user profile
router.put('/profile', protect, updateProfile);


// Fetch all users (Admin only)
router.get('/', protect, admin, getAllUsers);

module.exports = router;
