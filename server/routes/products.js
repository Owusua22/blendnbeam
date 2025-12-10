const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByShowroom,
  deleteProductImage,
} = require("../controllers/productController");

// All products (with filters)
router.get("/", getProducts);

// Get by category
router.get("/category/:categoryId", getProductsByCategory);

// Get by showroom
router.get("/showroom/:showroomId", getProductsByShowroom);

// Single product
router.get("/:id", getProduct);

// Create product (with images)
router.post("/", upload.array("images", 10), createProduct);

// Update product (add images)
router.put("/:id", upload.array("images", 10), updateProduct);

// Delete a single image
router.delete("/image/:productId/:publicId", deleteProductImage);

// Delete entire product + all images
router.delete("/:id", deleteProduct);

module.exports = router;
