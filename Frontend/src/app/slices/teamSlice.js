import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamAPI } from '../../api/team.api';

// Fetch team members
export const fetchTeamMembers = createAsyncThunk(
  'team/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await teamAPI.getTeamMembers();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch team members');
    }
  }
);

// Add team member
export const addTeamMember = createAsyncThunk(
  'team/addMember',
  async (memberData, { rejectWithValue }) => {
    try {
      const data = await teamAPI.addTeamMember(memberData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add member');
    }
  }
);

// ✅ Update team member
export const updateTeamMember = createAsyncThunk(
  'team/updateMember',
  async ({ memberId, data }, { rejectWithValue }) => {
    try {
      const result = await teamAPI.updateTeamMember(memberId, data);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update member');
    }
  }
);

// ✅ Delete team member
export const deleteTeamMember = createAsyncThunk(
  'team/deleteMember',
  async (memberId, { rejectWithValue }) => {
    try {
      await teamAPI.deleteTeamMember(memberId);
      return memberId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete member');
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add member
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      
      // ✅ Update member
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.list.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      
      // ✅ Delete member
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.list = state.list.filter(m => m.id !== action.payload);
      });
  },
});

export default teamSlice.reducer;