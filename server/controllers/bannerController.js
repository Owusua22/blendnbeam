const asyncHandler = require("express-async-handler");
const Banner = require("../models/Banner");
const cloudinary = require("../config/cloudinary");

/**
 * Upload an image to Cloudinary.
 * Supports BOTH:
 *  - memoryStorage: req.file.buffer
 *  - cloudinary storage (multer-storage-cloudinary): req.file.path already exists
 */
const uploadBannerImage = async (file) => {
  if (!file) {
    const err = new Error("Banner image is required");
    err.statusCode = 400;
    throw err;
  }

  // Case 1: multer-storage-cloudinary (already uploaded)
  // file.path = secure url, file.filename = public id (commonly)
  if (file.path && (file.filename || file.public_id)) {
    return {
      secure_url: file.path,
      public_id: file.filename || file.public_id,
    };
  }

  // Case 2: memoryStorage (buffer upload_stream)
  if (file.buffer) {
    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "banners", resource_type: "image" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(file.buffer);
    });
  }

  // If neither exists, file middleware is misconfigured
  const err = new Error(
    "Upload middleware misconfigured. Expected file.buffer (memoryStorage) or file.path (cloudinary storage)."
  );
  err.statusCode = 500;
  throw err;
};

const parseBool = (v, fallback) => {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
};

const parseNumber = (v, fallback = 0) => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* ===================================================
   CREATE BANNER (ADMIN)
   POST /api/banners
   form-data: image + title/subtitle/link/isActive/position
   =================================================== */
const createBanner = asyncHandler(async (req, res) => {
  try {
   

    const uploadResult = await uploadBannerImage(req.file);

    const banner = await Banner.create({
      title: req.body.title || "",
      subtitle: req.body.subtitle || "",
      link: req.body.link || "",
      isActive: parseBool(req.body.isActive, true),
      position: parseNumber(req.body.position, 0),
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });

    return res.status(201).json(banner);
  } catch (err) {
    console.error("[BANNER] createBanner error:", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Banner upload failed" });
  }
});

/* ===================================================
   GET ACTIVE BANNERS (PUBLIC)
   GET /api/banners
   =================================================== */
const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({
    position: 1,
    createdAt: -1,
  });
  res.json(banners);
});

/* ===================================================
   GET ALL BANNERS (ADMIN)
   GET /api/banners/all
   =================================================== */
const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ position: 1, createdAt: -1 });
  res.json(banners);
});

/* ===================================================
   UPDATE BANNER (ADMIN)
   PUT /api/banners/:id
   form-data optional: image + title/subtitle/link/isActive/position
   =================================================== */
const updateBanner = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Update fields if sent
    if (req.body.title !== undefined) banner.title = req.body.title;
    if (req.body.subtitle !== undefined) banner.subtitle = req.body.subtitle;
    if (req.body.link !== undefined) banner.link = req.body.link;
    if (req.body.position !== undefined) banner.position = parseNumber(req.body.position, banner.position ?? 0);
    if (req.body.isActive !== undefined) banner.isActive = parseBool(req.body.isActive, banner.isActive);

    // Replace image if provided
    if (req.file) {
      // delete old image
      if (banner.image?.publicId) {
        await cloudinary.uploader.destroy(banner.image.publicId);
      }

      const uploadResult = await uploadBannerImage(req.file);
      banner.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const updated = await banner.save();
    return res.json(updated);
  } catch (err) {
    console.error("[BANNER] updateBanner error:", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Banner update failed" });
  }
});

/* ===================================================
   DELETE BANNER (ADMIN)
   DELETE /api/banners/:id
   =================================================== */
const deleteBanner = asyncHandler(async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (banner.image?.publicId) {
      await cloudinary.uploader.destroy(banner.image.publicId);
    }

    await banner.deleteOne();
    return res.json({ message: "Banner deleted" });
  } catch (err) {
    console.error("[BANNER] deleteBanner error:", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Banner delete failed" });
  }
});

module.exports = {
  createBanner,
  getActiveBanners,
  getAllBanners,
  updateBanner,
  deleteBanner,
};