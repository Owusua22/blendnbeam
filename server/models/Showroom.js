// models/Showroom.js
const mongoose = require("mongoose");

const showroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Showroom name is required"],
      trim: true,
    },
    

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Showroom", showroomSchema);
