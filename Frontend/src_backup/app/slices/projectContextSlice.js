import { createSlice } from '@reduxjs/toolkit';

const projectContextSlice = createSlice({
    name: 'projectContext',
    initialState: {
        currentProject: null,
    },
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
    },
});

export const { setCurrentProject, clearCurrentProject } =
    projectContextSlice.actions;

export default projectContextSlice.reducer;
