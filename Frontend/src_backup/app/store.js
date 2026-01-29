import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import issueReducer from './slices/issueSlice';
import teamReducer from './slices/teamSlice';
import sprintReducer from './slices/sprintSlice'; // ✅ REQUIRED
import projectContextReducer from './slices/projectContextSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    issues: issueReducer,
    team: teamReducer,
    sprints: sprintReducer, // ✅ REQUIRED
    projectContext: projectContextReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
