import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

export const fetchSprintsByProject = createAsyncThunk(
    'sprints/fetchByProject',
    async (projectId, { rejectWithValue }) => {
        try {
            console.log('🔄 Fetching sprints for project:', projectId);
            const response = await axiosInstance.get('/sprints/', {
                params: { project: projectId }
            });
            console.log('✅ Sprints:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Failed to fetch sprints:', error.response?.data);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const sprintSlice = createSlice({
    name: 'sprints',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearSprintError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSprintsByProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSprintsByProject.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchSprintsByProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSprintError } = sprintSlice.actions;
export default sprintSlice.reducer;