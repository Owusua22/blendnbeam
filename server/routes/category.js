// routes/categoryRoutes.js
const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryByName,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/name/:name", getCategoryByName);

module.exports = router;
