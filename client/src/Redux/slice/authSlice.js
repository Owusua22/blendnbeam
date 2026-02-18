import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  registerAdmin,
  loginAdmin,
} from "../../api";

const userInfoFromStorage = (() => {
  try {
    return JSON.parse(localStorage.getItem("userInfo")) || null;
  } catch {
    return null;
  }
})();

const saveUserInfo = (data) => {
  localStorage.setItem("userInfo", JSON.stringify(data));
};

const clearUserInfo = () => {
  localStorage.removeItem("userInfo");
};

// Helper to extract best possible error message
const getErrMsg = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

// -------------------- THUNKS -------------------- //

export const registerUserThunk = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerUser(userData);
      saveUserInfo(data);
      return data;
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Registration failed"));
    }
  }
);

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);
      saveUserInfo(data);
      return data;
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Login failed"));
    }
  }
);

export const registerAdminThunk = createAsyncThunk(
  "auth/registerAdmin",
  async (adminData, { rejectWithValue }) => {
    try {
      // Ensure payload includes admin role (you asked for this)
      const payload = { ...adminData, role: "admin" };

      const data = await registerAdmin(payload);

      // ✅ Do NOT reject here — registration succeeded.
      // If backend didn't return role, we still continue.
      const normalized = {
        ...data,
        role: data?.role || "admin", // fallback
      };

      saveUserInfo(normalized);
      return normalized;
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Admin registration failed"));
    }
  }
);

export const loginAdminThunk = createAsyncThunk(
  "auth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginAdmin(credentials);

      // Soft validation:
      // If backend returns role and it's not admin => reject
      if (data?.role && data.role !== "admin") {
        return rejectWithValue("This account is not an admin.");
      }

      // If backend doesn't return role, don’t hard-fail; store what we have.
      const normalized = {
        ...data,
        role: data?.role || "admin", // optional fallback; remove if you prefer strictness
      };

      saveUserInfo(normalized);
      return normalized;
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Admin login failed"));
    }
  }
);

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      if (!token) return rejectWithValue("Not authenticated");
      return await getProfile(token);
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to load profile"));
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      if (!token) return rejectWithValue("Not authenticated");
      const data = await updateProfile(profileData, token);
      saveUserInfo(data);
      return data;
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Profile update failed"));
    }
  }
);

export const fetchAllUsersThunk = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.userInfo?.token;
      const role = getState().auth.userInfo?.role;

      if (!token) return rejectWithValue("Not authenticated");
      if (role !== "admin") return rejectWithValue("Admin access required");

      return await getAllUsers(token);
    } catch (err) {
      return rejectWithValue(getErrMsg(err, "Failed to fetch users"));
    }
  }
);

// -------------------- SLICE -------------------- //

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userInfo: userInfoFromStorage,
    loading: false,
    error: null,
    users: [],
  },
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      state.users = [];
      state.error = null;
      state.loading = false;
      clearUserInfo();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Request failed";
    };

    builder
      // user register/login
      .addCase(registerUserThunk.pending, pending)
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(registerUserThunk.rejected, rejected)

      .addCase(loginUserThunk.pending, pending)
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(loginUserThunk.rejected, rejected)

      // admin register/login
      .addCase(registerAdminThunk.pending, pending)
      .addCase(registerAdminThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(registerAdminThunk.rejected, rejected)

      .addCase(loginAdminThunk.pending, pending)
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(loginAdminThunk.rejected, rejected)

      // profile
      .addCase(fetchProfileThunk.pending, pending)
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        // keep token if profile endpoint doesn't return it
        state.userInfo = { ...state.userInfo, ...action.payload };
      })
      .addCase(fetchProfileThunk.rejected, rejected)

      .addCase(updateProfileThunk.pending, pending)
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(updateProfileThunk.rejected, rejected)

      // admin users list
      .addCase(fetchAllUsersThunk.pending, pending)
      .addCase(fetchAllUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsersThunk.rejected, rejected);
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

// Selectors (optional)
export const selectUserInfo = (state) => state.auth.userInfo;
export const selectIsLoggedIn = (state) => Boolean(state.auth.userInfo?.token);
export const selectIsAdmin = (state) => state.auth.userInfo?.role === "admin";