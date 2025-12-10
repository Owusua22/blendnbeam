const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// ---------------------------------------------------
// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
// ---------------------------------------------------
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    cartId,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!cartId) {
    return res.status(400).json({ message: "Cart ID is required" });
  }

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "No order items found" });
  }

  const formattedItems = orderItems.map(item => ({
    productId: item.productId,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
  }));

  const order = new Order({
    user: req.user._id,
    cart: cartId,
    orderItems: formattedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    status: 'pending',
  });

  const createdOrder = await order.save();

  // ⭐ Populate user name + phone before sending response
  await createdOrder.populate('user', 'name phone email');

  res.status(201).json(createdOrder);
});

// ---------------------------------------------------
// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
// ---------------------------------------------------
exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('cart') // optional, if you want cart details
    .sort({ createdAt: -1 });

  res.json(orders);
});


// ---------------------------------------------------
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
// ---------------------------------------------------
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('cart')
    .populate('orderItems.productId', 'name price images');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(order);
});


// ---------------------------------------------------
// @desc    Update order to PAID
// @route   PUT /api/orders/:id/pay
// @access  Private
// ---------------------------------------------------
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'cancelled') return res.status(400).json({ message: 'Cannot pay for a cancelled order' });

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';
  order.paymentResult = {
    id: req.body.id || '',
    status: req.body.status || 'COMPLETED',
    update_time: req.body.update_time || new Date().toISOString(),
    email_address: req.body.email_address || ''
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});


// ---------------------------------------------------
// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// ---------------------------------------------------
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[order.status].includes(status)) {
    return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` });
  }

  order.status = status;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  if (status === 'cancelled') {
    order.isPaid = false;
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});


// ---------------------------------------------------
// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
// ---------------------------------------------------
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('cart')
    .sort({ createdAt: -1 });

  res.json(orders);
});
