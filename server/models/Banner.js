const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    link: { type: String, trim: true }, // e.g. "/sale" or external URL

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    isActive: { type: Boolean, default: true },

    // optional ordering on homepage
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);