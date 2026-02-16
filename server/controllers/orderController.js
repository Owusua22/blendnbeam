const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Shipping = require('../models/Shipping');

/* ===================================================
   CREATE ORDER
   POST /api/orders
   =================================================== */
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    cartId,
    orderItems,
    shippingAddress,
    shippingLocationId,
    paymentMethod,
    itemsPrice,
    taxPrice = 0,
    note,
  } = req.body;

  if (!cartId) {
    return res.status(400).json({ message: 'Cart ID is required' });
  }

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  if (!shippingLocationId) {
    return res.status(400).json({ message: 'Shipping location is required' });
  }

  /* 🔹 Validate shipping zone */
  const shippingLocation = await Shipping.findOne({
    _id: shippingLocationId,
    isActive: true,
  });

  if (!shippingLocation) {
    return res
      .status(404)
      .json({ message: 'Invalid or inactive shipping location' });
  }

  /* 🔹 Format order items */
  const formattedItems = orderItems.map((item) => ({
    productId: item.productId,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
  }));

  /* 🔹 Pricing (SERVER CONTROLLED) */
  const shippingPrice = shippingLocation.deliveryCharge;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    cart: cartId,
    orderItems: formattedItems,
    note,

    shippingLocation: shippingLocation._id,
    shippingAddress,

    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,

    status: 'pending',
  });

  await order.populate([
    { path: 'user', select: 'name email phone' },
    { path: 'shippingLocation', select: 'name deliveryCharge estimate' },
  ]);

  res.status(201).json(order);
});

/* ===================================================
   GET LOGGED-IN USER ORDERS
   GET /api/orders/myorders
   =================================================== */
exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('shippingLocation', 'name deliveryCharge estimate')
    .sort({ createdAt: -1 });

  res.json(orders);
});

/* ===================================================
   GET ORDER BY ID
   GET /api/orders/:id
   =================================================== */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('cart')
    .populate('shippingLocation', 'name deliveryCharge estimate')
    .populate('orderItems.productId', 'name price images');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(order);
});

/* ===================================================
   UPDATE ORDER TO PAID
   PUT /api/orders/:id/pay
   =================================================== */
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status === 'cancelled') {
    return res
      .status(400)
      .json({ message: 'Cannot pay for a cancelled order' });
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'processing';

  order.paymentResult = {
    id: req.body.id || '',
    status: req.body.status || 'COMPLETED',
    update_time: req.body.update_time || new Date().toISOString(),
    email_address: req.body.email_address || '',
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

/* ===================================================
   UPDATE ORDER STATUS (ADMIN)
   PUT /api/orders/:id/status
   =================================================== */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    return res.status(400).json({
      message: `Cannot change status from ${order.status} to ${status}`,
    });
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

/* ===================================================
   GET ALL ORDERS (ADMIN)
   GET /api/orders
   =================================================== */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('shippingLocation', 'name deliveryCharge')
    .sort({ createdAt: -1 });

  res.json(orders);
});
