import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByShowroom,
} from "../../api";

// ---------------- Thunks ----------------
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProducts();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load products");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getProductById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load product");
    }
  }
);

export const addProduct = createAsyncThunk(
  "products/add",
  async ({ productData, token }, { rejectWithValue }) => {
    try {
      const res = await createProduct(productData, token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create product");
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/edit",
  async ({ id, productData, token }, { rejectWithValue }) => {
    try {
      const res = await updateProduct(id, productData, token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update product");
    }
  }
);

export const removeProduct = createAsyncThunk(
  "products/delete",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await deleteProduct(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete product");
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await getProductsByCategory(categoryId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load products");
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/search",
  async (query, { rejectWithValue }) => {
    try {
      const res = await getProducts({ search: query });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to search products");
    }
  }
);

export const fetchProductsByShowroom = createAsyncThunk(
  "products/fetchByShowroom",
  async (showroomId, { rejectWithValue }) => {
    try {
      const res = await getProductsByShowroom(showroomId);
      return { showroomId, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load products");
    }
  }
);

// ---------------- Slice ----------------

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    productsByShowroom: {},
    productsByCategory: {},
    loadingProductsByShowroom: false,
    errorProductsByShowroom: null,

    product: null,
    loadingProducts: false,
    loadingProduct: false,
    updatingProduct: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH ALL PRODUCTS
      .addCase(fetchProducts.pending, (state) => {
        state.loadingProducts = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.products = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.payload;
      })

      // FETCH BY CATEGORY
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.products = action.payload || [];
      })

      // FETCH BY SHOWROOM
      .addCase(fetchProductsByShowroom.pending, (state) => {
        state.loadingProductsByShowroom = true;
      })
      .addCase(fetchProductsByShowroom.fulfilled, (state, action) => {
        state.loadingProductsByShowroom = false;
        state.productsByShowroom[action.payload.showroomId] = action.payload.data || [];
      })
      .addCase(fetchProductsByShowroom.rejected, (state, action) => {
        state.loadingProductsByShowroom = false;
        state.errorProductsByShowroom = action.payload;
      })

      // FETCH PRODUCT BY ID
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.product = action.payload;
      })

      // ADD PRODUCT
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })

      // EDIT PRODUCT
      .addCase(editProduct.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      // SEARCH PRODUCTS
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.products = action.payload || [];
      })

      // DELETE PRODUCT
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      });
  },
});

export default productSlice.reducer;
