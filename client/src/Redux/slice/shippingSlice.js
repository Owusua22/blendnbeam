import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getShippingList,
  getShippingById,
  createShipping,
  updateShipping,
  deleteShipping,
} from "../../api";

// helper to get token from state
const getToken = (getState) => getState().auth.userInfo?.token;

// ---------------- Thunks ----------------

export const fetchShippingList = createAsyncThunk(
  "shipping/fetchList",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await getShippingList(filters);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchShippingById = createAsyncThunk(
  "shipping/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getShippingById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createShippingZone = createAsyncThunk(
  "shipping/create",
  async (shippingData, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");
      const data = await createShipping(shippingData, token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateShippingZone = createAsyncThunk(
  "shipping/update",
  async ({ id, shippingData }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");
      const data = await updateShipping(id, shippingData, token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteShippingZone = createAsyncThunk(
  "shipping/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) return rejectWithValue("Not authenticated");
      const data = await deleteShipping(id, token);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ---------------- Slice ----------------

const initialState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  success: false,
};

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    resetShippingState: (state) => {
      state.list = [];
      state.selected = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearShippingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchShippingList
    builder.addCase(fetchShippingList.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(fetchShippingList.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload || [];
      state.success = true;
    });
    builder.addCase(fetchShippingList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
      state.success = false;
    });

    // fetchShippingById
    builder.addCase(fetchShippingById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchShippingById.fulfilled, (state, action) => {
      state.loading = false;
      state.selected = action.payload || null;
    });
    builder.addCase(fetchShippingById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
    });

    // createShippingZone
    builder.addCase(createShippingZone.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(createShippingZone.fulfilled, (state, action) => {
      state.loading = false;
      state.list = [action.payload, ...state.list];
      state.success = true;
    });
    builder.addCase(createShippingZone.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
      state.success = false;
    });

    // updateShippingZone
    builder.addCase(updateShippingZone.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(updateShippingZone.fulfilled, (state, action) => {
      state.loading = false;
      const updated = action.payload;
      state.list = state.list.map((z) => (z._id === updated._id ? updated : z));
      if (state.selected && state.selected._id === updated._id) {
        state.selected = updated;
      }
      state.success = true;
    });
    builder.addCase(updateShippingZone.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
      state.success = false;
    });

    // deleteShippingZone
    builder.addCase(deleteShippingZone.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });
    builder.addCase(deleteShippingZone.fulfilled, (state, action) => {
      state.loading = false;
      const deletedId = action.payload?._id || action.meta.arg;
      state.list = state.list.filter((z) => z._id !== deletedId);
      if (state.selected && state.selected._id === deletedId) state.selected = null;
      state.success = true;
    });
    builder.addCase(deleteShippingZone.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message;
      state.success = false;
    });
  },
});

export const { resetShippingState, clearShippingError } = shippingSlice.actions;
export default shippingSlice.reducer;

