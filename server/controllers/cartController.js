const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ===================== GET CART ===================== //
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({ path: "items.product", select: "name price images color variants sku" })
      .populate({ path: "items.variant" });

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
    const { productId, quantity = 1, color, size, variantId } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Determine variant by variantId or by size (if product has variants)
    let selectedVariant = null;
    if (product.variants && product.variants.length > 0) {
      if (variantId) {
        selectedVariant = product.variants.find(v => v._id.toString() === variantId.toString());
      } else if (size) {
        selectedVariant = product.variants.find(v => String(v.size) === String(size));
      }
    }

    // If variant is present, validate stock
    if (selectedVariant) {
      if ((selectedVariant.stock || 0) === 0) {
        return res.status(400).json({ message: "Selected size is out of stock" });
      }
      if (quantity > (selectedVariant.stock || 0)) {
        return res.status(400).json({ message: `Only ${selectedVariant.stock} items available for the selected size` });
      }
    } else {
      // No variant selected - validate product stock if available
      if (product.stock !== undefined && product.stock !== null) {
        if (product.stock === 0) {
          return res.status(400).json({ message: "Product is out of stock" });
        }
        if (quantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items available` });
        }
      }
    }

    // Choose price authoritative on server side
    const unitPrice = selectedVariant?.price ?? product.price;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        user: req.user.id,
        items: [{
          product: productId,
          name: product.name,
          image: product.images[0]?.url || '',
          price: unitPrice,
          sizePrice: selectedVariant ? selectedVariant.price : undefined,
          variant: selectedVariant ? selectedVariant._id : undefined,
          quantity,
          color: color || null,
          size: size || (selectedVariant ? selectedVariant.size : null)
        }]
      });
    } else {
      // Check if same product/color/size exists (variant-aware matching)
      const index = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId.toString() &&
          item.color === (color || null) &&
          item.size === (size || (selectedVariant ? selectedVariant.size : null))
      );

      if (index > -1) {
        // Update quantity, but re-validate against variant/product stock
        const existingItem = cart.items[index];
        const newQuantity = existingItem.quantity + quantity;

        // If existing item references a variant, verify variant stock
        if (existingItem.variant) {
          const variantInProduct = product.variants.find(v => v._id.toString() === existingItem.variant.toString());
          const available = variantInProduct?.stock ?? 0;
          if (newQuantity > available) {
            return res.status(400).json({ message: `Only ${available} items available for the selected size` });
          }
        } else {
          // product-level stock
          if (product.stock !== undefined && newQuantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items available` });
          }
        }

        existingItem.quantity = newQuantity;

        // Ensure the stored price aligns with authoritative price
        existingItem.price = unitPrice;
        if (selectedVariant) {
          existingItem.sizePrice = selectedVariant.price;
          existingItem.variant = selectedVariant._id;
        }
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          name: product.name,
          image: product.images[0]?.url || '',
          price: unitPrice,
          sizePrice: selectedVariant ? selectedVariant.price : undefined,
          variant: selectedVariant ? selectedVariant._id : undefined,
          quantity,
          color: color || null,
          size: size || (selectedVariant ? selectedVariant.size : null)
        });
      }
    }

    await calculateCartTotal(cart);
    await cart.save();

    await cart.populate({ path: "items.product", select: "name price images color variants sku" });
    await cart.populate({ path: "items.variant" });

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

    // Validate against product/variant stock
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: "Product not found for cart item" });

    if (item.variant) {
      const variant = product.variants.find(v => v._id.toString() === item.variant.toString());
      const available = variant?.stock ?? 0;
      if (quantity > available) {
        return res.status(400).json({ message: `Only ${available} items available for the selected size` });
      }
      // Ensure prices remain authoritative
      item.price = variant?.price ?? product.price;
      item.sizePrice = variant?.price;
    } else {
      if (product.stock !== undefined && quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} items available` });
      }
      item.price = product.price;
      item.sizePrice = undefined;
    }

    item.quantity = quantity;

    await calculateCartTotal(cart);
    await cart.save();

    await cart.populate({ path: "items.product", select: "name price images color variants sku" });
    await cart.populate({ path: "items.variant" });

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

    await cart.populate({ path: "items.product", select: "name price images color variants sku" });
    await cart.populate({ path: "items.variant" });

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
  let itemsPrice = 0;
  for (let item of cart.items) {
    // Ensure item.price exists and is authoritative
    if (item.variant) {
      // If variant is referenced, try to pull latest price from product record (optional)
      const product = await Product.findById(item.product);
      const variant = product?.variants?.find(v => v._id.toString() === item.variant.toString());
      if (variant && (variant.price !== undefined && variant.price !== null)) {
        item.price = variant.price;
        item.sizePrice = variant.price;
      } else if (product) {
        item.price = product.price;
        item.sizePrice = undefined;
      }
    } else {
      if (!item.price) {
        const product = await Product.findById(item.product);
        if (product) item.price = product.price;
      }
    }

    itemsPrice += (Number(item.price) || 0) * (Number(item.quantity) || 0);
  }

  cart.itemsPrice = itemsPrice;
  const shipping = Number(cart.shippingPrice) || 0;
  const tax = Number(cart.taxPrice) || 0;
  cart.totalAmount = itemsPrice + shipping + tax;

  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};