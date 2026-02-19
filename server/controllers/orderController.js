// controllers/orderController.js
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
    customLocationName,
    shippingPricePending,
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

  if (!paymentMethod) {
    return res.status(400).json({ message: 'Payment method is required' });
  }

  // ✅ Must have either a shipping zone OR a custom location
  const hasShippingZone = !!shippingLocationId;
  const hasCustomLocation = !!(customLocationName && customLocationName.trim());

  if (!hasShippingZone && !hasCustomLocation) {
    return res.status(400).json({
      message: 'Please select a delivery zone or enter your location',
    });
  }

  /* 🔹 Resolve shipping zone (if selected) */
  let shippingLocation = null;
  let shippingPrice = 0;

  if (hasShippingZone) {
    shippingLocation = await Shipping.findOne({
      _id: shippingLocationId,
      isActive: true,
    });

    if (!shippingLocation) {
      return res
        .status(404)
        .json({ message: 'Invalid or inactive shipping location' });
    }

    shippingPrice = shippingLocation.deliveryCharge || 0;
  }
  // ✅ If custom location: shippingPrice stays 0, pending seller confirmation

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

  /* 🔹 Pricing */
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    cart: cartId,
    orderItems: formattedItems,
    note,

    // ✅ Shipping zone (null when custom location)
    shippingLocation: shippingLocation ? shippingLocation._id : null,
    shippingAddress,

    // ✅ Custom location fields
    customLocationName: hasCustomLocation ? customLocationName.trim() : null,
    shippingPricePending: hasCustomLocation ? true : false,

    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,

    status: 'pending',
  });

  // ✅ Populate — handle shippingLocation being null
  const populateFields = [
    { path: 'user', select: 'name email phone' },
  ];

  if (shippingLocation) {
    populateFields.push({
      path: 'shippingLocation',
      select: 'name deliveryCharge estimate',
    });
  }

  await order.populate(populateFields);

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

  const allowedStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'completed',
    'not answered',
  ];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = order.deliveredAt || Date.now();
  } else {
    order.isDelivered = false;
    order.deliveredAt = null;
  }

  if (status === 'cancelled' || status === 'refunded') {
    order.isPaid = false;
    order.paidAt = null;
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

/* ===================================================
   UPDATE ORDER SHIPPING PRICE (ADMIN)
   PUT /api/orders/:id/shipping-price
   Body: { shippingPrice: 25.00 }
   =================================================== */
exports.updateOrderShippingPrice = asyncHandler(async (req, res) => {
  const { shippingPrice } = req.body;

  if (shippingPrice == null || typeof shippingPrice !== 'number' || shippingPrice < 0) {
    return res.status(400).json({ message: 'Valid shipping price is required' });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Update shipping price and recalculate total
  order.shippingPrice = shippingPrice;
  order.totalPrice = order.itemsPrice + order.taxPrice + shippingPrice;
  order.shippingPricePending = false;

  const updatedOrder = await order.save();

  await updatedOrder.populate([
    { path: 'user', select: 'name email phone' },
    { path: 'shippingLocation', select: 'name deliveryCharge estimate' },
  ]);

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

/* ===================================================
   CANCEL ORDER (USER)
   PUT /api/orders/:id/cancel
   =================================================== */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (!['pending', 'processing'].includes(order.status)) {
    return res
      .status(400)
      .json({ message: `Cannot cancel a ${order.status} order` });
  }

  order.status = 'cancelled';
  order.isPaid = false;

  const updated = await order.save();
  res.json(updated);
});

/* ===================================================
   TOGGLE ORDER PAID (ADMIN)
   PUT /api/orders/:id/paid
   Body: { isPaid: true/false }
   =================================================== */
exports.setOrderPaidStatus = asyncHandler(async (req, res) => {
  const { isPaid } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (typeof isPaid !== 'boolean') {
    return res.status(400).json({ message: 'isPaid must be true or false' });
  }

  order.isPaid = isPaid;

  if (isPaid) {
    order.paidAt = order.paidAt || Date.now();
  } else {
    order.paidAt = null;
  }

  const updated = await order.save();
  res.json(updated);
});