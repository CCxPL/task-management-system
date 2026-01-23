import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { issuesAPI } from '../../api/issues.api';  // ✅ Only this import needed

/* ============================
   FETCH ISSUES
============================ */
export const fetchIssues = createAsyncThunk(
    'issues/fetchIssues',
    async (projectId, { rejectWithValue }) => {
        try {
            console.log('🔄 [issueSlice] Fetching issues for project:', projectId);
            const response = await issuesAPI.getIssues(projectId);
            console.log('✅ [issueSlice] Issues fetched:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [issueSlice] Failed to fetch issues:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ============================
   CREATE ISSUE
============================ */
export const createIssue = createAsyncThunk(
    'issues/createIssue',
    async (issueData, { rejectWithValue }) => {
        try {
            console.log('📝 [issueSlice] Creating issue:', issueData);
            const response = await issuesAPI.createIssue(issueData);
            console.log('✅ [issueSlice] Issue created:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [issueSlice] Failed to create issue:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ============================
   UPDATE ISSUE STATUS
============================ */
export const updateIssueStatus = createAsyncThunk(
    'issues/updateIssueStatus',
    async ({ issueId, status }, { rejectWithValue }) => {
        try {
            console.log(`🔄 [issueSlice] Updating issue ${issueId} → ${status}`);
            
            const response = await issuesAPI.updateIssueStatus(issueId, status);
            
            console.log('✅ [issueSlice] Backend response:', response.data);
            
            return { issueId, status };
        } catch (error) {
            console.error('❌ [issueSlice] Update failed:', error);
            console.error('❌ [issueSlice] Error response:', error.response?.data);
            
            return rejectWithValue({
                message: error.message,
                error: error.response?.data?.error,
                available_transitions: error.response?.data?.available_transitions,
                status: error.response?.status
            });
        }
    }
);

/* ============================
   SLICE
============================ */
const issueSlice = createSlice({
    name: 'issues',

    initialState: {
        list: [],
        kanbanIssues: {
            BACKLOG: [],
            TO_DO: [],
            IN_PROGRESS: [],
            REVIEW: [],
            DONE: [],
        },
        loading: false,
        error: null,
    },

    reducers: {
        moveIssueLocally: (state, action) => {
            const { issueId, fromStatus, toStatus } = action.payload;

            console.log(`🔄 [issueSlice] Local move: ${issueId} from ${fromStatus} to ${toStatus}`);

            if (!state.kanbanIssues[fromStatus] || !state.kanbanIssues[toStatus]) {
                console.warn('❌ [issueSlice] Invalid Kanban columns:', { fromStatus, toStatus });
                return;
            }

            const issueIndex = state.kanbanIssues[fromStatus].findIndex(i => i.id === issueId);
            if (issueIndex === -1) {
                console.warn('❌ [issueSlice] Issue not found in source column');
                return;
            }

            const [issue] = state.kanbanIssues[fromStatus].splice(issueIndex, 1);
            issue.status = toStatus;
            state.kanbanIssues[toStatus].push(issue);
            
            const listIndex = state.list.findIndex(i => i.id === issueId);
            if (listIndex !== -1) {
                state.list[listIndex].status = toStatus;
            }

            console.log('✅ [issueSlice] Local move complete');
        },

        clearIssueError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            /* ================= FETCH ================= */
            .addCase(fetchIssues.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIssues.fulfilled, (state, action) => {
                state.loading = false;

                const issues = Array.isArray(action.payload)
                    ? action.payload
                    : action.payload?.results || [];

                state.list = issues;

                console.log('📊 [issueSlice] Grouping issues by status');

                const grouped = {
                    BACKLOG: [],
                    TO_DO: [],
                    IN_PROGRESS: [],
                    REVIEW: [],
                    DONE: [],
                };

                issues.forEach(issue => {
                    const status = issue.status;
                    if (grouped[status]) {
                        grouped[status].push(issue);
                    } else {
                        console.warn(`⚠️ [issueSlice] Unknown status: ${status} for issue ${issue.id}`);
                    }
                });

                state.kanbanIssues = grouped;
                
                console.log('✅ [issueSlice] Issues grouped:', {
                    BACKLOG: grouped.BACKLOG.length,
                    TO_DO: grouped.TO_DO.length,
                    IN_PROGRESS: grouped.IN_PROGRESS.length,
                    REVIEW: grouped.REVIEW.length,
                    DONE: grouped.DONE.length,
                });
            })
            .addCase(fetchIssues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('❌ [issueSlice] Fetch issues failed:', action.payload);
            })

            /* ================= UPDATE STATUS ================= */
            .addCase(updateIssueStatus.fulfilled, (state, action) => {
                const { issueId, status: newStatus } = action.payload;
                
                console.log('✅ [issueSlice] Backend confirmed status update:', { issueId, newStatus });
                
                const issueIndex = state.list.findIndex(i => i.id === issueId);
                if (issueIndex !== -1) {
                    state.list[issueIndex].status = newStatus;
                }
                
                const statuses = ['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
                statuses.forEach(s => {
                    state.kanbanIssues[s] = state.list.filter(i => i.status === s);
                });
            })
            .addCase(updateIssueStatus.rejected, (state, action) => {
                console.error('❌ [issueSlice] Update status rejected:', action.payload);
                state.error = action.payload;
            })

            /* ================= CREATE ISSUE ================= */
            .addCase(createIssue.pending, (state) => {
                state.loading = true;
            })
            .addCase(createIssue.fulfilled, (state, action) => {
                state.loading = false;
                const newIssue = action.payload;
                
                console.log('✅ [issueSlice] Issue created, adding to state:', newIssue);
                
                state.list.push(newIssue);
                
                const status = newIssue.status || 'BACKLOG';
                if (state.kanbanIssues[status]) {
                    state.kanbanIssues[status].push(newIssue);
                    console.log(`✅ [issueSlice] Added to kanban: ${status}`);
                }
            })
            .addCase(createIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('❌ [issueSlice] Create issue failed:', action.payload);
            });
    },
});

export const {
    moveIssueLocally,
    clearIssueError,
} = issueSlice.actions;

export default issueSlice.reducer;