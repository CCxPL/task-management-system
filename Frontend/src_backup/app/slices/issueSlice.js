import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { issuesAPI } from '../../api/issues.api';

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
   UPDATE ISSUE
============================ */
export const updateIssue = createAsyncThunk(
    'issues/updateIssue',
    async ({ issueId, issueData }, { rejectWithValue }) => {
        try {
            console.log('📝 [issueSlice] Updating issue:', issueId, issueData);
            const response = await issuesAPI.updateIssue(issueId, issueData);
            console.log('✅ [issueSlice] Issue updated:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ [issueSlice] Failed to update issue:', error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ============================
   DELETE ISSUE
============================ */
export const deleteIssue = createAsyncThunk(
    'issues/deleteIssue',
    async (issueId, { rejectWithValue }) => {
        try {
            console.log('🗑️  [issueSlice] Deleting issue:', issueId);
            await issuesAPI.deleteIssue(issueId);
            console.log('✅ [issueSlice] Issue deleted');
            return issueId;
        } catch (error) {
            console.error('❌ [issueSlice] Failed to delete issue:', error);
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
        kanbanIssues: {},  // ✅ DYNAMIC - will be populated based on workflow
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

        // ✅ SET KANBAN COLUMNS DYNAMICALLY
        setKanbanColumns: (state, action) => {
            const columns = action.payload;
            console.log('🔄 [issueSlice] Setting kanban columns:', columns);
            
            // Initialize empty arrays for each column
            const kanbanIssues = {};
            columns.forEach(col => {
                kanbanIssues[col.frontendKey] = [];
            });
            
            // Distribute issues into columns
            state.list.forEach(issue => {
                const column = columns.find(col => col.frontendKey === issue.status);
                if (column && kanbanIssues[column.frontendKey]) {
                    kanbanIssues[column.frontendKey].push(issue);
                } else {
                    console.warn(`⚠️ Issue ${issue.id} has unknown status: ${issue.status}`);
                }
            });
            
            state.kanbanIssues = kanbanIssues;
            console.log('✅ [issueSlice] Kanban columns set:', Object.keys(kanbanIssues));
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

                // ✅ Group issues into existing kanban columns
                const grouped = {};
                Object.keys(state.kanbanIssues).forEach(key => {
                    grouped[key] = [];
                });

                issues.forEach(issue => {
                    const status = issue.status;
                    if (grouped[status] !== undefined) {
                        grouped[status].push(issue);
                    } else {
                        console.warn(`⚠️ [issueSlice] Unknown status: ${status} for issue ${issue.id}`);
                    }
                });

                state.kanbanIssues = grouped;
                
                console.log('✅ [issueSlice] Issues grouped:', 
                    Object.keys(grouped).map(key => `${key}: ${grouped[key].length}`)
                );
            })
            .addCase(fetchIssues.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* ================= CREATE ISSUE ================= */
            .addCase(createIssue.pending, (state) => {
                state.loading = true;
            })
            .addCase(createIssue.fulfilled, (state, action) => {
                state.loading = false;
                const newIssue = action.payload;
                
                state.list.push(newIssue);
                
                const status = newIssue.status;
                if (state.kanbanIssues[status]) {
                    state.kanbanIssues[status].push(newIssue);
                }
            })
            .addCase(createIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* ================= UPDATE ISSUE ================= */
            .addCase(updateIssue.fulfilled, (state, action) => {
                const updatedIssue = action.payload;
                
                const listIndex = state.list.findIndex(i => i.id === updatedIssue.id);
                if (listIndex !== -1) {
                    const oldStatus = state.list[listIndex].status;
                    state.list[listIndex] = updatedIssue;
                    
                    if (oldStatus !== updatedIssue.status) {
                        if (state.kanbanIssues[oldStatus]) {
                            state.kanbanIssues[oldStatus] = state.kanbanIssues[oldStatus].filter(
                                i => i.id !== updatedIssue.id
                            );
                        }
                        if (state.kanbanIssues[updatedIssue.status]) {
                            state.kanbanIssues[updatedIssue.status].push(updatedIssue);
                        }
                    } else {
                        const kanbanIndex = state.kanbanIssues[updatedIssue.status]?.findIndex(
                            i => i.id === updatedIssue.id
                        );
                        if (kanbanIndex !== -1) {
                            state.kanbanIssues[updatedIssue.status][kanbanIndex] = updatedIssue;
                        }
                    }
                }
            })

            /* ================= DELETE ISSUE ================= */
            .addCase(deleteIssue.fulfilled, (state, action) => {
                const issueId = action.payload;
                
                state.list = state.list.filter(i => i.id !== issueId);
                
                Object.keys(state.kanbanIssues).forEach(status => {
                    state.kanbanIssues[status] = state.kanbanIssues[status].filter(
                        i => i.id !== issueId
                    );
                });
            })

            /* ================= UPDATE STATUS ================= */
            .addCase(updateIssueStatus.fulfilled, (state, action) => {
                const { issueId, status: newStatus } = action.payload;
                
                const issueIndex = state.list.findIndex(i => i.id === issueId);
                if (issueIndex !== -1) {
                    state.list[issueIndex].status = newStatus;
                }
                
                Object.keys(state.kanbanIssues).forEach(status => {
                    state.kanbanIssues[status] = state.list.filter(i => i.status === status);
                });
            });
    },
});

export const {
    moveIssueLocally,
    clearIssueError,
    setKanbanColumns,  // ✅ EXPORT THIS
} = issueSlice.actions;

export default issueSlice.reducer;