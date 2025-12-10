const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    // Base price (used when product has no size variants)
    price: {
      type: Number,
      min: 0,
      default: null, 
    },

    oldPrice: Number,

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    showroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showroom",
    },

    images: [
      {
        url: String,
        alt: String,
        publicId: String,
      },
    ],

    stock: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ⭐ NEW: Proper structure for products with multiple sizes AND multiple prices
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0 },
      },
    ],

    // Colors not tied to size
    color: {
      type: [String],
      default: [],
    },

    sku: {
      type: String,
      unique: true,
      required: true,
    },

    features: [String],
  
    specifications: {
  type: Object,
  default: {},
},

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Product", productSchema);
