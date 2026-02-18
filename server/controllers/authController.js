const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ----------------------------------------
// REGISTER USER
// ----------------------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// ----------------------------------------
// LOGIN USER
// ----------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// ----------------------------------------
// GET USER PROFILE
// ----------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// ----------------------------------------
// UPDATE USER PROFILE
// ----------------------------------------
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields only if provided
    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      user.password = password; // pre-save hook will hash it
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id), // refresh token
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// ----------------------------------------
// REGISTER ADMIN
// ----------------------------------------
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await User.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin", // force admin role
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ----------------------------------------
// ADMIN LOGIN
// ----------------------------------------
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email });

    if (
      admin &&
      admin.role === "admin" &&
      (await admin.comparePassword(password))
    ) {
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    }

    return res.status(401).json({ message: "Invalid admin credentials" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// ----------------------------------------
// FETCH ALL USERS (ADMIN ONLY)
// ----------------------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
