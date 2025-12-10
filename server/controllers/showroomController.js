// controllers/showroomController.js
const Showroom = require("../models/Showroom");

// @desc Create showroom
exports.createShowroom = async (req, res) => {
  try {
    const { name } = req.body;
    const showroom = await Showroom.create({
      name,
      
    });
    res.status(201).json(showroom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get all showrooms
exports.getShowrooms = async (req, res) => {
  try {
    const showrooms = await Showroom.find()
      .populate( "name")
      .sort({ createdAt: -1 });
    res.json(showrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get showroom by ID
exports.getShowroomById = async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id).populate( "name");
    if (!showroom) return res.status(404).json({ message: "Showroom not found" });
    res.json(showroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update showroom
exports.updateShowroom = async (req, res) => {
  try {
    const updated = await Showroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete showroom
exports.deleteShowroom = async (req, res) => {
  try {
    await Showroom.findByIdAndDelete(req.params.id);
    res.json({ message: "Showroom deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
