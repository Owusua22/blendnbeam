// src/Redux/slice/productSlice.js
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

/* ---------------- Thunks ---------------- */

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProducts();
      return res.data || res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load products"
      );
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
      return rejectWithValue(
        err.response?.data?.message || "Failed to load product"
      );
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
      return rejectWithValue(
        err.response?.data?.message || "Failed to create product"
      );
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
      return rejectWithValue(
        err.response?.data?.message || "Failed to update product"
      );
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
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await getProductsByCategory(categoryId);
      return { categoryId, data: res.data || [] };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load products"
      );
    }
  }
);

export const searchProducts = createAsyncThunk(
  "products/search",
  async (query, { rejectWithValue }) => {
    try {
      const res = await getProducts({ search: query });
      return { query, data: res.data || [] };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to search products"
      );
    }
  }
);

export const fetchProductsByShowroom = createAsyncThunk(
  "products/fetchByShowroom",
  async (showroomId, { rejectWithValue }) => {
    try {
      const res = await getProductsByShowroom(showroomId);
      return { showroomId, data: res.data || [] };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load products"
      );
    }
  }
);

/* ---------------- Initial State ---------------- */

const initialState = {
  products: [],

  productsByShowroom: {},
  loadingProductsByShowroom: false,
  errorProductsByShowroom: null,

  productsByCategory: {},
  loadingProductsByCategory: {},
  errorProductsByCategory: {},

  searchResults: [],
  lastSearchQuery: "",
  loadingSearch: false,

  // single product
  product: null,
  currentProductId: null, // ✅ Added: tracks which product ID we're loading/displaying

  // global flags & error
  loadingProducts: false,
  loadingProduct: false,
  updatingProduct: false,
  error: null,
};

/* ---------------- Helpers ---------------- */

const updateProductInArray = (array, updated) =>
  array.map((p) => (p._id === updated._id ? updated : p));

const removeProductFromArray = (array, id) =>
  array.filter((p) => p._id !== id);

/* ---------------- Slice ---------------- */

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // ✅ Added: clears single product state so navigation shows skeleton
    clearProduct: (state) => {
      state.product = null;
      state.currentProductId = null;
      state.error = null;
    },
    // ✅ Added: clears just the error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL PRODUCTS */
      .addCase(fetchProducts.pending, (state) => {
        state.loadingProducts = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.products = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.payload;
      })

      /* FETCH PRODUCT BY ID */
      .addCase(fetchProductById.pending, (state, action) => {
        state.loadingProduct = true;
        state.error = null;
        // ✅ Track which product ID is being fetched
        state.currentProductId = action.meta.arg;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingProduct = false;
        state.product = action.payload;
        // ✅ Update to the actual product ID from response
        state.currentProductId = action.payload?._id || null;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingProduct = false;
        state.error = action.payload;
        state.product = null;
      })

      /* FETCH BY CATEGORY */
      .addCase(fetchProductsByCategory.pending, (state, action) => {
        const categoryId = action.meta.arg;
        state.loadingProductsByCategory[categoryId] = true;
        state.errorProductsByCategory[categoryId] = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const { categoryId, data } = action.payload;
        state.loadingProductsByCategory[categoryId] = false;
        state.productsByCategory[categoryId] = data || [];
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        const categoryId = action.meta.arg;
        state.loadingProductsByCategory[categoryId] = false;
        state.errorProductsByCategory[categoryId] =
          action.payload || "Failed to load products by category";
      })

      /* FETCH BY SHOWROOM */
      .addCase(fetchProductsByShowroom.pending, (state) => {
        state.loadingProductsByShowroom = true;
        state.errorProductsByShowroom = null;
      })
      .addCase(fetchProductsByShowroom.fulfilled, (state, action) => {
        state.loadingProductsByShowroom = false;
        const { showroomId, data } = action.payload;
        state.productsByShowroom[showroomId] = data || [];
      })
      .addCase(fetchProductsByShowroom.rejected, (state, action) => {
        state.loadingProductsByShowroom = false;
        state.errorProductsByShowroom = action.payload;
      })

      /* SEARCH PRODUCTS */
      .addCase(searchProducts.pending, (state) => {
        state.loadingSearch = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loadingSearch = false;
        const { query, data } = action.payload;
        state.lastSearchQuery = query;
        state.searchResults = data || [];
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loadingSearch = false;
        state.error = action.payload;
      })

      /* ADD PRODUCT */
      .addCase(addProduct.pending, (state) => {
        state.updatingProduct = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.updatingProduct = false;
        const newProduct = action.payload;
        state.products.unshift(newProduct);
        const catId =
          typeof newProduct.category === "string"
            ? newProduct.category
            : newProduct.category?._id;
        if (catId && state.productsByCategory[catId]) {
          state.productsByCategory[catId].unshift(newProduct);
        }
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.updatingProduct = false;
        state.error = action.payload;
      })

      /* EDIT PRODUCT */
      .addCase(editProduct.pending, (state) => {
        state.updatingProduct = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.updatingProduct = false;
        const updated = action.payload;
        state.products = updateProductInArray(state.products, updated);
        Object.keys(state.productsByCategory).forEach((catId) => {
          state.productsByCategory[catId] = updateProductInArray(
            state.productsByCategory[catId],
            updated
          );
        });
        Object.keys(state.productsByShowroom).forEach((showroomId) => {
          state.productsByShowroom[showroomId] = updateProductInArray(
            state.productsByShowroom[showroomId],
            updated
          );
        });
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.updatingProduct = false;
        state.error = action.payload;
      })

      /* DELETE PRODUCT */
      .addCase(removeProduct.pending, (state) => {
        state.updatingProduct = true;
        state.error = null;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.updatingProduct = false;
        const id = action.payload;
        state.products = removeProductFromArray(state.products, id);
        Object.keys(state.productsByCategory).forEach((catId) => {
          state.productsByCategory[catId] = removeProductFromArray(
            state.productsByCategory[catId],
            id
          );
        });
        Object.keys(state.productsByShowroom).forEach((showroomId) => {
          state.productsByShowroom[showroomId] = removeProductFromArray(
            state.productsByShowroom[showroomId],
            id
          );
        });
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.updatingProduct = false;
        state.error = action.payload;
      });
  },
});

// ✅ Export the new actions
export const { clearProduct, clearError } = productSlice.actions;
export default productSlice.reducer;