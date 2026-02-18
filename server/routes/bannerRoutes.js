const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const {
  createBanner,
  getActiveBanners,
  getAllBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

// Your auth middlewares (adjust import/path to your project)
const { protect, admin } = require("../middleware/authMiddleware");

// Public: active banners
router.get("/", getActiveBanners);

// Admin: all banners
router.get("/all", protect, admin, getAllBanners);

// Admin: create
router.post("/", protect, admin, upload.single("image"), createBanner);

// Admin: update
router.put("/:id", protect, admin, upload.single("image"), updateBanner);

// Admin: delete
router.delete("/:id", protect, admin, deleteBanner);

module.exports = router;