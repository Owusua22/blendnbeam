import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../api";

const getToken = (getState) => getState().auth.userInfo?.token;

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
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
 async ({ productId, quantity, color, size, price }, { getState, rejectWithValue }) => {

    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");

      const data = await addToCart({ productId, quantity, color, size, price}, token);
      return normalizeCart(data ?? null);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
      return rejectWithValue(err.response?.data || err.message);
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
      return rejectWithValue(err.response?.data || err.message);
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
      return null; // cart cleared
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ---------------- Helper ----------------

// Replace your normalizeCart function with this fixed version:

const normalizeCart = (cart) => {
  if (!cart) return null;

  console.log('=== NORMALIZE CART DEBUG ===');
  console.log('Raw cart from backend:', cart);
  console.log('Raw cart.items:', cart.items);

  const items = (cart.items || []).map(item => {
    console.log('\n--- Processing item ---');
    console.log('Full item:', item);
    console.log('item.price:', item.price);
    console.log('item.product:', item.product);
    console.log('item.product?.price:', item.product?.price);
    
    // FIXED: Try multiple sources for the price
    let finalPrice = 0;
    
    // Priority 1: Use the stored item.price (this is what we sent from frontend)
    if (item.price !== undefined && item.price !== null && item.price !== 0) {
      finalPrice = Number(item.price);
      console.log('Using item.price:', finalPrice);
    }
    // Priority 2: Fallback to product.price if item.price is missing
    else if (item.product?.price !== undefined && item.product?.price !== null) {
      finalPrice = Number(item.product.price);
      console.log('Using item.product.price:', finalPrice);
    }
    
    console.log('Final price for this item:', finalPrice);

    const normalizedItem = {
      _id: item._id,
      product: item.product?._id || item.product,
      name: item.product?.name || item.name || 'Unknown Product',
      image: item.product?.images?.[0]?.url || item.image || '/placeholder.jpg',
      price: finalPrice, // Use the resolved price
      quantity: Number(item.quantity) || 0,
      color: item.color || null,
      size: item.size || null,
    };
    
    console.log('Normalized item:', normalizedItem);
    return normalizedItem;
  });

  const itemsPrice = items.reduce((sum, i) => {
    const itemTotal = (Number(i.price) || 0) * (Number(i.quantity) || 0);
    console.log(`Item ${i.name}: price=${i.price} x qty=${i.quantity} = ${itemTotal}`);
    return sum + itemTotal;
  }, 0);
  
  const shippingPrice = Number(cart.shippingPrice) || 0;
  const taxPrice = Number(cart.taxPrice) || 0;
  const totalAmount = itemsPrice + shippingPrice + taxPrice;

  console.log('\nCart Totals:');
  console.log('Items Price:', itemsPrice);
  console.log('Shipping:', shippingPrice);
  console.log('Tax:', taxPrice);
  console.log('Total:', totalAmount);
  console.log('=== END NORMALIZE DEBUG ===\n');

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

// ---------------- Slice ----------------

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetCartState: (state) => {
      state.cart = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const fulfilled = (state, action) => { state.loading = false; state.cart = action.payload; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

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
      .addCase(clearUserCart.fulfilled, fulfilled)
      .addCase(clearUserCart.rejected, rejected);
  },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
