import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const API_URL = import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}";


// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};

const safeReadJsonOrText = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { detail: text };
  }
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await safeReadJsonOrText(res);

      if (!res.ok) {
        const msg = data?.detail || data?.error || "Login failed";
        throw new Error(msg);
      }

      // Expecting SimpleJWT style: { access, refresh }
      if (!data?.access || !data?.refresh) {
        throw new Error("Invalid login response (missing tokens).");
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Immediately fetch user profile (role/org etc.)
      await dispatch(fetchMe()).unwrap();

      return { access: data.access, refresh: data.refresh };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  "accounts/me",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token");

      const res = await fetch(`${API_URL}/api/accounts/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeReadJsonOrText(res);

      if (!res.ok) {
        const msg = data?.detail || data?.error || "Unauthorized";
        throw new Error(msg);
      }

      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) throw new Error("No refresh token available");

      const res = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      const data = await safeReadJsonOrText(res);

      if (!res.ok) {
        const msg = data?.detail || data?.error || "Token refresh failed";
        throw new Error(msg);
      }

      if (!data?.access) throw new Error("No access token in refresh response");

      localStorage.setItem("access_token", data.access);

      // optional: sync some user info from token
      const payload = decodeToken(data.access);
      if (payload) {
        const existingUser = JSON.parse(localStorage.getItem("user") || "null");
        if (existingUser) {
          const updatedUser = {
            ...existingUser,
            id: payload.user_id || payload.id || existingUser.id,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      return data.access;
    } catch {
      localStorage.clear();
      return rejectWithValue("Session expired. Please login again.");
    }
  }
);

const initialState = {
  user: (() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  })(),
  tokens: {
    access: localStorage.getItem("access_token") || null,
    refresh: localStorage.getItem("refresh_token") || null,
  },
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // clear storage
      localStorage.clear();

      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    syncUserFromToken: (state) => {
      const token = state.tokens.access || localStorage.getItem("access_token");
      if (!token) return;

      const payload = decodeToken(token);
      if (!payload) return;

      if (state.user) {
        state.user = {
          ...state.user,
          id: payload.user_id || payload.id || state.user.id,
        };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens.access = action.payload.access;
        state.tokens.refresh = action.payload.refresh;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.user = null;
        state.tokens = { access: null, refresh: null };
      })

      // ME
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unauthorized";
        state.user = null;
      })

      // REFRESH
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens.access = action.payload;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.tokens = { access: null, refresh: null };
      });
  },
});

export const { logout, clearError, syncUserFromToken } = authSlice.actions;
export default authSlice.reducer;
