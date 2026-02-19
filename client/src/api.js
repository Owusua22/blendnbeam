import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ---------------- AUTH ----------------
// Register user
export const registerUser = async (userData) => {
  const { data } = await axios.post(`${API_URL}/users/register`, userData);
  return data;
};

// Login user
export const loginUser = async (credentials) => {
  const { data } = await axios.post(`${API_URL}/users/login`, credentials);
  return data;
};

// Get logged-in user profile
export const getProfile = async (token) => {
  const { data } = await axios.get(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Update logged-in user profile
export const updateProfile = async (profileData, token) => {
  const { data } = await axios.put(`${API_URL}/users/profile`, profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Get all users (Admin only)
export const getAllUsers = async (token) => {
  const { data } = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
// ---------------- ADMIN AUTH ----------------

// Register admin
export const registerAdmin = async (adminData) => {
  const { data } = await axios.post(`${API_URL}/users/admin/register`, adminData);
  return data;
};

// Login admin
export const loginAdmin = async (credentials) => {
  const { data } = await axios.post(`${API_URL}/users/admin/login`, credentials);
  return data;
};

// ---------------- PRODUCTS ----------------
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await axios.get(`${API_URL}/products?${params}`);
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/products/${id}`);
  return data;
};

export const createProduct = async (productData, token) => {
  const { data } = await axios.post(`${API_URL}/products`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateProduct = async (id, productData, token) => {
  const { data } = await axios.put(`${API_URL}/products/${id}`, productData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteProduct = async (id, token) => {
  const { data } = await axios.delete(`${API_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ NEW: Get products by category
export const getProductsByCategory = async (categoryId) => {
  const { data } = await axios.get(`${API_URL}/products/category/${categoryId}`);
  return data;
};

// ✅ NEW: Get products by showroom
// Corrected: only ONE "showroom" in the URL
export const getProductsByShowroom = async (showroomId) => {
  const { data } = await axios.get(`${API_URL}/products/showroom/${showroomId}`);
  return data; // <- this returns { success: true, data: [...] }
};


// ---------------- ORDERS ----------------
export const createOrder = async (orderData, token) => {
  const { data } = await axios.post(`${API_URL}/orders`, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getUserOrders = async (token) => {
  const { data } = await axios.get(`${API_URL}/orders/myorders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getOrderById = async (id, token) => {
  const { data } = await axios.get(`${API_URL}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ✅ NEW: Set order paid status (Admin only)
export const setOrderPaidStatus = async (id, isPaid, token) => {
  const { data } = await axios.put(
    `${API_URL}/orders/${id}/paid`,
    { isPaid },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};


export const getAllOrders = async (token) => {
  const { data } = await axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
// Update order status (Admin only: pending → processing → shipped → delivered → cancelled)
export const updateOrderStatus = async (id, status, token) => {
  const { data } = await axios.put(
    `${API_URL}/orders/${id}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};
// Cancel order (User only)
export const cancelOrder = async (id, token) => {
  const { data } = await axios.put(`${API_URL}/orders/${id}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};



// ---------------- CATEGORIES ----------------
export const getCategories = async () => {
  const { data } = await axios.get(`${API_URL}/categories`);
  return data;
};

export const getCategoryById = async (id) => {
  const { data } = await axios.get(`${API_URL}/categories/${id}`);
  return data;
};

export const createCategory = async (categoryData, token) => {
  const { data } = await axios.post(`${API_URL}/categories`, categoryData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateCategory = async (id, categoryData, token) => {
  const { data } = await axios.put(`${API_URL}/categories/${id}`, categoryData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteCategory = async (id, token) => {
  const { data } = await axios.delete(`${API_URL}/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ---------------- SHOWROOMS ----------------
export const getShowrooms = async () => {
  const { data } = await axios.get(`${API_URL}/showrooms`);
  return data;
};

export const getShowroomById = async (id) => {
  const { data } = await axios.get(`${API_URL}/showrooms/${id}`);
  return data;
};

export const createShowroom = async (showroomData, token) => {
  const { data } = await axios.post(`${API_URL}/showrooms`, showroomData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateShowroom = async (id, showroomData, token) => {
  const { data } = await axios.put(`${API_URL}/showrooms/${id}`, showroomData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteShowroom = async (id, token) => {
  const { data } = await axios.delete(`${API_URL}/showrooms/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
// ---------------- CART ----------------

// Get user's cart
export const getCart = async (token) => {
  const { data } = await axios.get(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Add item to cart
export const addToCart = async (body, token) => {
  const { data } = await axios.post(
    `${API_URL}/cart`,
    body,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};


// Update cart item quantity
export const updateCartItem = async (itemId, quantity, token) => {
  const { data } = await axios.put(
    `${API_URL}/cart/items/${itemId}`,
    { quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

// Remove item from cart
export const removeFromCart = async (itemId, token) => {
  const { data } = await axios.delete(`${API_URL}/cart/items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Clear entire cart
export const clearCart = async (token) => {
  const { data } = await axios.delete(`${API_URL}/cart/clear`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// ---------------- SHIPPING ----------------
// Get all shipping zones (optional filters via query object)
export const getShippingList = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await axios.get(`${API_URL}/shipping?${params}`);
  return data;
};

// Get single shipping zone by id
export const getShippingById = async (id) => {
  const { data } = await axios.get(`${API_URL}/shipping/${id}`);
  return data;
};

// Create a shipping zone (admin)
export const createShipping = async (shippingData, token) => {
  const { data } = await axios.post(`${API_URL}/shipping`, shippingData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Update a shipping zone (admin)
export const updateShipping = async (id, shippingData, token) => {
  const { data } = await axios.put(`${API_URL}/shipping/${id}`, shippingData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Delete a shipping zone (admin)
export const deleteShipping = async (id, token) => {
  const { data } = await axios.delete(`${API_URL}/shipping/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
// ---------------- BANNERS ----------------

// Public: get active banners
export const getActiveBanners = async () => {
  const { data } = await axios.get(`${API_URL}/banners`);
  return data;
};

// Admin: get all banners
export const getAllBanners = async (token) => {
  const { data } = await axios.get(`${API_URL}/banners/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Admin: create banner (upload image)
// bannerData: { title?, subtitle?, link?, isActive?, position?, image: File }
export const createBanner = async (bannerData, token) => {
  const form = new FormData();
  if (bannerData.title) form.append("title", bannerData.title);
  if (bannerData.subtitle) form.append("subtitle", bannerData.subtitle);
  if (bannerData.link) form.append("link", bannerData.link);

  // booleans/numbers must be strings in multipart
  if (bannerData.isActive !== undefined) form.append("isActive", String(bannerData.isActive));
  if (bannerData.position !== undefined) form.append("position", String(bannerData.position));

  // image file required
  form.append("image", bannerData.image);

  const { data } = await axios.post(`${API_URL}/banners`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// Admin: update banner (optional image)
// updates: { title?, subtitle?, link?, isActive?, position?, image?: File }
export const updateBanner = async (id, updates, token) => {
  const form = new FormData();
  
  if (updates.link !== undefined) form.append("link", updates.link);
  if (updates.isActive !== undefined) form.append("isActive", String(updates.isActive));
  if (updates.position !== undefined) form.append("position", String(updates.position));
  if (updates.image) form.append("image", updates.image);

  const { data } = await axios.put(`${API_URL}/banners/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

// Admin: delete banner
export const deleteBanner = async (id, token) => {
  const { data } = await axios.delete(`${API_URL}/banners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};