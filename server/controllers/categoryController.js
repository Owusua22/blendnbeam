// controllers/categoryController.js
const Category = require("../models/Category");

// @desc Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc Get category by name
exports.getCategoryByName = async (req, res) => {
  try {
    const name = req.params.name;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Case-insensitive search
    const category = await Category.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") }
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
