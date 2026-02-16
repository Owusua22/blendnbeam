const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema(
  {
    // A friendly name for the location/zone (e.g. "Accra", "Greater Accra", "Kumasi Zone")
    name: { type: String, required: true, trim: true },

    // Optional code/key for the zone (e.g. "ACCRA", "GT-ACC")
    code: { type: String, trim: true, index: true },

    // Delivery charge for this location (in your currency units)
    deliveryCharge: { type: Number, required: true, min: 0, default: 0 },

    // Delivery time estimate (optional text: e.g. "1-2 business days")
    estimate: { type: String, trim: true },

    // Whether this shipping option is active/available
    isActive: { type: Boolean, default: true },

    // Which admin/user created this record (optional)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipping', shippingSchema);