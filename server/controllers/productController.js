const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Helper: Parse JSON or accept array
const parseJSON = (value) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return value;
  }
};

// =======================================================
//  GET ALL PRODUCTS
// =======================================================
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      showroom,
      brand,
      search,
      color,
      isActive,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const numericLimit = Math.max(parseInt(limit), 1);
    const numericPage = Math.max(parseInt(page), 1);

    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (category) query.category = category;
    if (showroom) query.showroom = showroom;

    if (brand) query.brand = new RegExp(brand, "i");

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    if (color) {
      const colorArray = color.split(",").map((c) => c.trim());
      query.color = { $in: colorArray };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("showroom", "name")
        .sort(sort)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),

      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        totalPages: Math.ceil(total / numericLimit),
        currentPage: numericPage,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================================================
// GET BY CATEGORY
// =======================================================
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
    })
      .populate("category", "name")
      .populate("showroom", "name");

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Category Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================================================
// GET BY SHOWROOM
// =======================================================
exports.getProductsByShowroom = async (req, res) => {
  try {
    const products = await Product.find({
      showroom: req.params.showroomId,
      isActive: true,
    })
      .populate("category", "name")
      .populate("showroom", "name");

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Showroom Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================================================
// GET SINGLE PRODUCT
// =======================================================
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("showroom", "name");

    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =======================================================
// CREATE PRODUCT (supports variants + base price)
// =======================================================
exports.createProduct = async (req, res) => {
  try {
    // Handle images
    let uploadedImages = [];
    if (req.files?.length) {
      uploadedImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename || file.public_id,
        alt: req.body.name,
      }));
    }

    // Parse variants (size + price)
    const variants = req.body.variants ? parseJSON(req.body.variants) : [];

    // If variants exist, force base price to null
    const basePrice = variants.length > 0 ? null : req.body.price || null;

    const product = await Product.create({
      ...req.body,
      price: basePrice,
      variants,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =======================================================
// UPDATE PRODUCT
// =======================================================
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Not found" });

    let updatedImages = [...product.images];

    // Add new images
    if (req.files?.length) {
      req.files.forEach((file) =>
        updatedImages.push({
          url: file.path,
          publicId: file.filename || file.public_id,
          alt: req.body.name || "product-image",
        })
      );
    }

    // Parse incoming variants
    const variants = req.body.variants
      ? parseJSON(req.body.variants)
      : product.variants;

    // Auto-handle base price logic
    const basePrice = variants.length > 0 ? null : req.body.price || product.price;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        price: basePrice,
        variants,
        images: updatedImages,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// =======================================================
// DELETE ONE IMAGE
// =======================================================
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, publicId } = req.params;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter((img) => img.publicId !== publicId);

    await product.save();

    res.json({ success: true, message: "Image deleted", data: product });
  } catch (error) {
    console.error("Delete Image Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =======================================================
// DELETE PRODUCT (soft delete + remove images)
// =======================================================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Remove images from cloud
    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }

    // Soft delete
    product.isActive = false;
    product.images = [];

    await product.save();

    res.json({
      success: true,
      message: "Product deleted & images removed",
      data: product,
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
