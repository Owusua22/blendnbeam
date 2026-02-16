import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api";

// -------------------- THUNKS --------------------

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll", 
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch single category
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getCategoryById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create new category
export const addCategory = createAsyncThunk(
  "categories/add",
  async ({ categoryData, token }, { rejectWithValue }) => {
    try {
      const data = await createCategory(categoryData, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update category
export const editCategory = createAsyncThunk(
  "categories/edit",
  async ({ id, categoryData, token }, { rejectWithValue }) => {
    try {
      const data = await updateCategory(id, categoryData, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete category
export const removeCategory = createAsyncThunk(
  "categories/remove",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await deleteCategory(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// -------------------- SLICE --------------------
const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedCategory: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // Add
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // Update
      .addCase(editCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })

      // Delete
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
