// app/slices/teamSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

export const fetchTeamMembers = createAsyncThunk(
    'team/fetchMembers',
    async (_, { rejectWithValue }) => {  // ✅ No need for orgId parameter
        try {
            console.log('🔄 Fetching team members...');
            
            const response = await axiosInstance.get('/accounts/team/');
            
            console.log('✅ Team members response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch team members:', error.response?.data);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const addTeamMember = createAsyncThunk(
    'team/addMember',
    async (memberData, { rejectWithValue }) => {
        try {
            console.log('📝 Adding team member:', memberData);
            
            const response = await axiosInstance.post('/accounts/create-org-user/', {
                email: memberData.email,
                username: memberData.name,
                role: memberData.role,
            });
            
            console.log('✅ Member added:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to add member:', error.response?.data);
            return rejectWithValue(error.response?.data || error.message);
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
    reducers: {
        clearTeamError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeamMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTeamMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
                console.log('✅ Team members loaded:', action.payload.length);
            })
            .addCase(fetchTeamMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addTeamMember.fulfilled, (state, action) => {
                // Note: backend returns different format, so just refetch
                console.log('✅ Member added, will refetch list');
            });
    },
});

export const { clearTeamError } = teamSlice.actions;
export default teamSlice.reducer;