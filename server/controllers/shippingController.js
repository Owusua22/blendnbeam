const Shipping = require('../models/Shipping');

// Create a new shipping location (admin)
const createShipping = async (req, res) => {
  try {
    // basic server-side validation
    const { name, code, deliveryCharge, estimate, isActive } = req.body;
    if (!name || deliveryCharge === undefined) {
      return res.status(400).json({ message: 'name and deliveryCharge are required' });
    }

    const shipping = new Shipping({
      name: name.trim(),
      code: code ? String(code).trim() : undefined,
      deliveryCharge: Number(deliveryCharge),
      estimate: estimate ? String(estimate).trim() : undefined,
      isActive: isActive === undefined ? true : Boolean(isActive),
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    await shipping.save();
    res.status(201).json(shipping);
  } catch (error) {
    console.error('createShipping error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all shipping locations (public)
const getAllShipping = async (req, res) => {
  try {
    // Allow query params for filtering/sorting if desired
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.search) {
      const q = String(req.query.search).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
      ];
    }

    const shippingList = await Shipping.find(filter).sort({ createdAt: -1 });
    res.json(shippingList);
  } catch (error) {
    console.error('getAllShipping error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single shipping location by id
const getShippingById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipping = await Shipping.findById(id);
    if (!shipping) return res.status(404).json({ message: 'Shipping location not found' });
    res.json(shipping);
  } catch (error) {
    console.error('getShippingById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a shipping location (admin)
const updateShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, deliveryCharge, estimate, isActive } = req.body;

    const shipping = await Shipping.findById(id);
    if (!shipping) return res.status(404).json({ message: 'Shipping location not found' });

    if (name !== undefined) shipping.name = String(name).trim();
    if (code !== undefined) shipping.code = String(code).trim();
    if (deliveryCharge !== undefined) shipping.deliveryCharge = Number(deliveryCharge);
    if (estimate !== undefined) shipping.estimate = String(estimate);
    if (isActive !== undefined) shipping.isActive = Boolean(isActive);
    shipping.updatedBy = req.user?.id;

    await shipping.save();
    res.json(shipping);
  } catch (error) {
    console.error('updateShipping error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a shipping location (admin)
const deleteShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const shipping = await Shipping.findById(id);
    if (!shipping) return res.status(404).json({ message: 'Shipping location not found' });

    await Shipping.findByIdAndDelete(id);
    res.json({ message: 'Shipping location deleted' });
  } catch (error) {
    console.error('deleteShipping error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createShipping,
  getAllShipping,
  getShippingById,
  updateShipping,
  deleteShipping,
};