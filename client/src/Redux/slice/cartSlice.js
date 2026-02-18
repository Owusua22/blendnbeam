import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../../api";
import { createOrderThunk } from "./orderSlice";

const getToken = (getState) => getState().auth.userInfo?.token;

const CART_CACHE_KEY = "app:cart:v1";

const loadCartFromCache = () => {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem(CART_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch {}
  return null;
};

const saveCartToCache = (cart) => {
  try {
    if (!cart) {
      if (typeof localStorage !== "undefined") localStorage.removeItem(CART_CACHE_KEY);
      return;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cart));
    }
  } catch {}
};

// ✅ Always return a string error message
const getErrMsg = (err, fallback = "Request failed") => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === "string" ? err.response.data : null) ||
    err?.message ||
    fallback;

  return String(msg);
};

// ---------------- Helper ----------------
const normalizeCart = (cart) => {
  if (!cart) return null;

  const items = (cart.items || []).map((item) => {
    let finalPrice = 0;

    if (item.sizePrice !== undefined && item.sizePrice !== null) {
      finalPrice = Number(item.sizePrice);
    } else if (item.price !== undefined && item.price !== null) {
      finalPrice = Number(item.price);
    } else if (item.product?.price !== undefined && item.product?.price !== null) {
      finalPrice = Number(item.product.price);
    }

    return {
      _id: item._id,
      product: item.product?._id || item.product,
      name: item.product?.name || item.name || "Unknown Product",
      image: item.product?.images?.[0]?.url || item.image || "/placeholder.jpg",
      price: Number.isFinite(finalPrice) ? finalPrice : 0,
      quantity: Number(item.quantity) || 0,
      color: item.color || null,
      size: item.size || null,
      variant: item.variant || null,
      raw: item,
    };
  });

  const itemsPrice = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  );

  const shippingPrice = Number(cart.shippingPrice) || 0;
  const taxPrice = Number(cart.taxPrice) || 0;
  const totalAmount = itemsPrice + shippingPrice + taxPrice;

  return {
    _id: cart._id,
    user: cart.user,
    items,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalAmount,
  };
};

// ---------------- Thunks ----------------

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");

      const data = await getCart(token);
      return normalizeCart(data ?? null);
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to load cart"));
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ productId, quantity, color, size, price, sizePrice, variantId }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");

      const data = await addToCart(
        { productId, quantity, color, size, price, sizePrice, variantId },
        token
      );

      return normalizeCart(data ?? null);
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to add item to cart"));
    }
  }
);

export const updateCartItemQty = createAsyncThunk(
  "cart/updateCartItemQty",
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");

      const data = await updateCartItem(itemId, quantity, token);
      return normalizeCart(data ?? null);
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to update quantity"));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");

      const data = await removeFromCart(itemId, token);
      return normalizeCart(data ?? null);
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to remove item"));
    }
  }
);

export const clearUserCart = createAsyncThunk(
  "cart/clearUserCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");

      await clearCart(token);
      return null;
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to clear cart"));
    }
  }
);

// ---------------- Slice ----------------

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: loadCartFromCache(),
    loading: false,
    error: null, // ✅ now always string
    lastSyncedAt: 0,
  },
  reducers: {
    resetCartState: (state) => {
      state.cart = null;
      state.loading = false;
      state.error = null;
      state.lastSyncedAt = 0;
      saveCartToCache(null);
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };

    const fulfilled = (state, action) => {
      state.loading = false;
      state.cart = action.payload;
      state.lastSyncedAt = Date.now();
      saveCartToCache(action.payload);
    };

    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Request failed";

      if (action.payload === "Not authenticated") {
        state.cart = null;
        saveCartToCache(null);
      }
    };

    builder
      .addCase(fetchCart.pending, pending)
      .addCase(fetchCart.fulfilled, fulfilled)
      .addCase(fetchCart.rejected, rejected)

      .addCase(addItemToCart.pending, pending)
      .addCase(addItemToCart.fulfilled, fulfilled)
      .addCase(addItemToCart.rejected, rejected)

      .addCase(updateCartItemQty.pending, pending)
      .addCase(updateCartItemQty.fulfilled, fulfilled)
      .addCase(updateCartItemQty.rejected, rejected)

      .addCase(removeCartItem.pending, pending)
      .addCase(removeCartItem.fulfilled, fulfilled)
      .addCase(removeCartItem.rejected, rejected)

      .addCase(clearUserCart.pending, pending)
      .addCase(clearUserCart.fulfilled, (state) => {
        state.loading = false;
        state.cart = null;
        state.lastSyncedAt = Date.now();
        saveCartToCache(null);
      })
      .addCase(clearUserCart.rejected, rejected)

      // when order is created, clear cart
      .addCase(createOrderThunk.fulfilled, (state) => {
        state.loading = false;
        state.cart = null;
        state.lastSyncedAt = Date.now();
        saveCartToCache(null);
      });
  },
});

export const { resetCartState, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;