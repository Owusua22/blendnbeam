import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  markOrderPaid,
  updateOrderStatus,
} from "../../api";

// ---------------- Thunks ----------------

// Create a new order from cart
export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      const response = await createOrder(orderData, token);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all orders (Admin)
export const fetchAllOrdersThunk = createAsyncThunk(
  "orders/fetchAllOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from Redux auth slice
      const {
        auth: { userInfo },
      } = getState();

      const token = userInfo?.token;

      if (!token) {
        return rejectWithValue("No token found");
      }

      // Call API
      return await getAllOrders(token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// Fetch logged-in user's orders
export const fetchUserOrdersThunk = createAsyncThunk(
  "orders/fetchUserOrders",
  async (token, { rejectWithValue }) => {
    try {
      return await getUserOrders(token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch single order by ID
export const fetchOrderByIdThunk = createAsyncThunk(
  "orders/fetchOrderById",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      return await getOrderById(id, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Mark order as paid
export const markOrderPaidThunk = createAsyncThunk(
  "orders/markPaid",
  async ({ id, paymentResult, token }, { rejectWithValue }) => {
    try {
      return await markOrderPaid(id, paymentResult, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update order status (Admin)
export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, status, token }, { rejectWithValue }) => {
    try {
      return await updateOrderStatus(id, status, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ---------------- Slice ----------------

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],        // Admin view of all orders
    userOrders: [],    // User's own orders
    currentOrder: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload;
        state.userOrders.unshift(action.payload); // Add to user's orders
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all orders (Admin)
      .addCase(fetchAllOrdersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user's orders
      .addCase(fetchUserOrdersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single order by ID
      .addCase(fetchOrderByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark order as paid
      .addCase(markOrderPaidThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(markOrderPaidThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentOrder = action.payload;
        // Update in userOrders and orders arrays
        state.userOrders = state.userOrders.map(o => o._id === action.payload._id ? action.payload : o);
        state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
      })
      .addCase(markOrderPaidThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update order status (Admin)
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update order in both lists if exists
        state.orders = state.orders.map(o => o._id === action.payload._id ? action.payload : o);
        state.userOrders = state.userOrders.map(o => o._id === action.payload._id ? action.payload : o);
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
