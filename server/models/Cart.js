const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  // unit price for this cart item (reflects variant price when a size is selected)
  price: Number,
  // explicit size price field (keeps semantics clear on the model)
  sizePrice: { type: Number },
  // store which variant was chosen (if your Product variants have their own IDs)
  variant: { type: mongoose.Schema.Types.ObjectId },
  quantity: { type: Number, required: true, min: 1 },
  color: String,
  size: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    itemsPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);