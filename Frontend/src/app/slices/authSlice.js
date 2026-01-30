import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from '../../config/api';

const API_URL = API_BASE_URL;

console.log('🔧 Auth API URL:', API_URL);

const safeReadJsonOrText = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { detail: text };
  }
};

// ✅ LOGIN - Use response user directly
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('📤 Login request...');
      
      const res = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await safeReadJsonOrText(res);

      console.log('📥 Login response:', data);

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Login failed");
      }

      if (!data?.access || !data?.refresh || !data?.user) {
        throw new Error("Invalid login response");
      }

      console.log('👤 User:', data.user);
      console.log('🎭 Role:', data.user.role);
      console.log('⚙️ Is Superuser:', data.user.is_superuser);

      // ✅ Store in localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log('✅ Login complete!');

      return { 
        access: data.access, 
        refresh: data.refresh,
        user: data.user
      };
    } catch (err) {
      console.error('❌ Login error:', err);
      return rejectWithValue(err.message);
    }
  }
);

// ✅ FETCH ME - For refresh/re-auth only
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token");

      console.log('📤 Fetching user profile from /me...');

      const res = await fetch(`${API_URL}/api/accounts/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeReadJsonOrText(res);

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Unauthorized");
      }

      console.log('📥 User profile from /me:', data);
      console.log('🎭 Role:', data.role);

      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('❌ Fetch me error:', err);
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Load from storage
const loadInitialState = () => {
  try {
    const userString = localStorage.getItem("user");
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    
    const user = userString ? JSON.parse(userString) : null;
    
    if (user) {
      console.log('🔄 Loaded from storage:');
      console.log('👤 User:', user);
      console.log('🎭 Role:', user.role);
      console.log('⚙️ Is Superuser:', user.is_superuser);
    }
    
    return {
      user,
      tokens: { access: access || null, refresh: refresh || null },
      loading: false,
      error: null,
    };
  } catch (error) {
    console.error('❌ Error loading state:', error);
    return {
      user: null,
      tokens: { access: null, refresh: null },
      loading: false,
      error: null,
    };
  }
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      console.log('🚪 Logging out...');
      localStorage.clear();
      state.user = null;
      state.tokens = { access: null, refresh: null };
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      console.log('👤 Setting user:', action.payload);
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
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
        console.log('✅ Login fulfilled!');
        state.loading = false;
        state.tokens.access = action.payload.access;
        state.tokens.refresh = action.payload.refresh;
        state.user = action.payload.user;  // ✅ From login response
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.error('❌ Login rejected:', action.payload);
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.user = null;
        state.tokens = { access: null, refresh: null };
      })

      // FETCH ME
      .addCase(fetchMe.fulfilled, (state, action) => {
        console.log('✅ Fetch me fulfilled');
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        console.error('❌ Fetch me rejected:', action.payload);
        state.loading = false;
        // Don't clear user on fetchMe failure
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;``