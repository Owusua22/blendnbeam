import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getShowrooms,
  getShowroomById,
  createShowroom,
  updateShowroom,
  deleteShowroom,
} from "../../api";

// -------------------- THUNKS --------------------

// Fetch all showrooms
export const fetchShowrooms = createAsyncThunk(
  "showrooms/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getShowrooms();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch single showroom
export const fetchShowroomById = createAsyncThunk(
  "showrooms/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getShowroomById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create showroom
export const addShowroom = createAsyncThunk(
  "showrooms/add",
  async ({ showroomData, token }, { rejectWithValue }) => {
    try {
      const data = await createShowroom(showroomData, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update showroom
export const editShowroom = createAsyncThunk(
  "showrooms/edit",
  async ({ id, showroomData, token }, { rejectWithValue }) => {
    try {
      const data = await updateShowroom(id, showroomData, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete showroom
export const removeShowroom = createAsyncThunk(
  "showrooms/remove",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await deleteShowroom(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// -------------------- SLICE --------------------
const showroomSlice = createSlice({
  name: "showrooms",
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedShowroom: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchShowrooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShowrooms.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchShowrooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchShowroomById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // Add
      .addCase(addShowroom.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // Update
      .addCase(editShowroom.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })

      // Delete
      .addCase(removeShowroom.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearSelectedShowroom } = showroomSlice.actions;
export default showroomSlice.reducer;
