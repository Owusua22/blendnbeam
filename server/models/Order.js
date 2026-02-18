const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true,
    },

    orderItems: [
      {
        _id: false,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: String,
        image: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        color: String,
        size: String,
      },
    ],

    note: String,

    /* 🔹 Shipping zone mapping */
    shippingLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipping',
      required: true,
    },

    /* 🔹 Physical delivery address */
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      country: String,
      phone: String,
  
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },


    /* 🔹 Comes from Shipping.deliveryCharge */
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled','refunded', 'completed', 'not answered'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
