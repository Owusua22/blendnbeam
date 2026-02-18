import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getActiveBanners,
  getAllBanners,
  createBanner as createBannerApi,
  updateBanner as updateBannerApi,
  deleteBanner as deleteBannerApi,
} from "../../api";

// Fetch active banners (public)
export const fetchActiveBannersThunk = createAsyncThunk(
  "banners/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      return await getActiveBanners();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all banners (admin)
export const fetchAllBannersThunk = createAsyncThunk(
  "banners/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      if (!token) return rejectWithValue("Not authenticated");
      return await getAllBanners(token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create banner (admin)
export const createBannerThunk = createAsyncThunk(
  "banners/create",
  async (bannerData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      if (!token) return rejectWithValue("Not authenticated");
      return await createBannerApi(bannerData, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update banner (admin)
export const updateBannerThunk = createAsyncThunk(
  "banners/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      if (!token) return rejectWithValue("Not authenticated");
      return await updateBannerApi(id, updates, token);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete banner (admin)
export const deleteBannerThunk = createAsyncThunk(
  "banners/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      if (!token) return rejectWithValue("Not authenticated");
      await deleteBannerApi(id, token);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const bannerSlice = createSlice({
  name: "banners",
  initialState: {
    active: [],
    all: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetBannerState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Request failed";
    };

    builder
      // active
      .addCase(fetchActiveBannersThunk.pending, pending)
      .addCase(fetchActiveBannersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(fetchActiveBannersThunk.rejected, rejected)

      // all (admin)
      .addCase(fetchAllBannersThunk.pending, pending)
      .addCase(fetchAllBannersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.all = action.payload;
      })
      .addCase(fetchAllBannersThunk.rejected, rejected)

      // create
      .addCase(createBannerThunk.pending, pending)
      .addCase(createBannerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.all = [action.payload, ...state.all];
        if (action.payload?.isActive) state.active = [action.payload, ...state.active];
      })
      .addCase(createBannerThunk.rejected, rejected)

      // update
      .addCase(updateBannerThunk.pending, pending)
      .addCase(updateBannerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const updated = action.payload;
        state.all = state.all.map((b) => (b._id === updated._id ? updated : b));

        // recompute active list simply
        state.active = state.all.filter((b) => b.isActive).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      })
      .addCase(updateBannerThunk.rejected, rejected)

      // delete
      .addCase(deleteBannerThunk.pending, pending)
      .addCase(deleteBannerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const id = action.payload;
        state.all = state.all.filter((b) => b._id !== id);
        state.active = state.active.filter((b) => b._id !== id);
      })
      .addCase(deleteBannerThunk.rejected, rejected);
  },
});

export const { resetBannerState } = bannerSlice.actions;
export default bannerSlice.reducer;