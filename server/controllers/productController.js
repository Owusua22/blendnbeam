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

// Helper: compute display price - lowest variant price if variants exist, otherwise base price
const getDisplayPrice = (product) => {
  if (!product) return 0;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    // collect numeric prices from variants (filter out invalid)
    const prices = variants
      .map((v) => {
        const num = Number(v?.price);
        return Number.isFinite(num) ? num : null;
      })
      .filter((p) => p !== null);

    if (prices.length > 0) return Math.min(...prices);
  }

  const base = Number(product.price);
  return Number.isFinite(base) ? base : 0;
};

// Utility: attach displayPrice to a product doc/object (non-destructive)
const withDisplayPrice = (productDoc) => {
  if (!productDoc) return productDoc;
  // ensure plain object
  const obj = typeof productDoc.toObject === "function" ? productDoc.toObject() : { ...productDoc };
  obj.displayPrice = getDisplayPrice(obj);
  return obj;
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

    // attach displayPrice to each returned product
    const productsWithPrice = products.map(withDisplayPrice);

    res.json({
      success: true,
      data: productsWithPrice,
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

    const productsWithPrice = products.map(withDisplayPrice);

    res.json({ success: true, data: productsWithPrice });
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

    const productsWithPrice = products.map(withDisplayPrice);

    res.json({ success: true, data: productsWithPrice });
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

    const productWithPrice = withDisplayPrice(product);

    res.json({ success: true, data: productWithPrice });
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

    const productWithPrice = withDisplayPrice(product);

    res.status(201).json({ success: true, data: productWithPrice });
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
    )
      .populate("category", "name")
      .populate("showroom", "name");

    const updatedWithPrice = withDisplayPrice(updated);

    res.json({ success: true, data: updatedWithPrice });
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

    res.json({ success: true, message: "Image deleted", data: withDisplayPrice(product) });
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
      return res.status(404).json({ success: true, message: "Product not found" });

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
      data: withDisplayPrice(product),
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};