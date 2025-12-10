const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ===================== GET CART ===================== //
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({ path: "items.product", select: "name price images color size" });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===================== ADD TO CART ===================== //
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, color, size } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        user: req.user.id,
        items: [{
          product: productId,
          name: product.name,
          image: product.images[0]?.url || '',
        price: req.body.price ?? product.price,

          quantity,
          color: color || null,
          size: size || null
        }]
      });
    } else {
      // Check if same product/color/size exists
      const index = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId.toString() &&
          item.color === (color || null) &&
          item.size === (size || null)
      );

      if (index > -1) {
        // Update quantity
        cart.items[index].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          name: product.name,
          image: product.images[0]?.url || '',
          price: product.price,
          quantity,
          color: color || null,
          size: size || null
        });
      }
    }

    await calculateCartTotal(cart);
    await cart.save();

    await cart.populate({ path: "items.product", select: "name price images color size" });

    res.status(201).json(cart);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===================== UPDATE CART ITEM ===================== //
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Update quantity and price
    item.quantity = quantity;
    const product = await Product.findById(item.product);
    if (product) item.price = product.price;

    await calculateCartTotal(cart);
    await cart.save();

    await cart.populate({ path: "items.product", select: "name price images color size" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===================== REMOVE ITEM ===================== //
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item._id.toString() !== itemId.toString());

    if (cart.items.length === 0) {
      // Reset cart by deleting it
      await Cart.findByIdAndDelete(cart._id);
      return res.json({ message: "Cart cleared", cart: null });
    }

    await calculateCartTotal(cart);
    await cart.save();

    await cart.populate({ path: "items.product", select: "name price images color size" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===================== CLEAR CART ===================== //
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Delete cart entirely to reset ID
    await Cart.findByIdAndDelete(cart._id);

    res.json({ message: "Cart cleared successfully", cart: null });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===================== HELPER - CALCULATE TOTAL ===================== //
const calculateCartTotal = async (cart) => {
  let total = 0;
  for (let item of cart.items) {
    if (!item.price) {
      const product = await Product.findById(item.product);
      if (product) item.price = product.price;
    }
    total += item.price * item.quantity;
  }
  cart.totalAmount = total;
  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
