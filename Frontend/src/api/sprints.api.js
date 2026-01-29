import axiosInstance from './axios.js';

export const sprintsAPI = {

  // ✅ CREATE SPRINT - Accepts projectId
  createSprint: async (projectId, sprintData) => {
    console.log('📝 Creating sprint for project:', projectId);
    console.log('📤 Sprint data:', sprintData);
    try {
      const response = await axiosInstance.post(
        `/sprints/projects/${projectId}/create/`,  // ✅ Backend URL
        sprintData
      );
      console.log('✅ Sprint created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create sprint:', error.response?.data);
      throw error;
    }
  },

  // ✅ Get sprints by project (query param)
  getSprintsByProject: async (projectId) => {
    console.log('📥 Fetching sprints for project:', projectId);
    try {
      const response = await axiosInstance.get('/sprints/', { 
        params: { project: projectId } 
      });
      console.log('✅ Sprints fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch sprints:', error.response?.data);
      throw error;
    }
  },

  // ✅ Get sprint by ID
  getSprintById: async (sprintId) => {
    console.log('📥 Fetching sprint:', sprintId);
    try {
      const response = await axiosInstance.get(`/sprints/${sprintId}/`);
      console.log('✅ Sprint fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch sprint:', error.response?.data);
      throw error;
    }
  },

  // ✅ Update sprint
  updateSprint: async (sprintId, sprintData) => {
    console.log('📝 Updating sprint:', sprintId);
    try {
      const response = await axiosInstance.patch(
        `/sprints/${sprintId}/update/`,
        sprintData
      );
      console.log('✅ Sprint updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update sprint:', error.response?.data);
      throw error;
    }
  },

  // ✅ Delete sprint
  deleteSprint: async (sprintId) => {
    console.log('🗑️  Deleting sprint:', sprintId);
    try {
      const response = await axiosInstance.delete(`/sprints/${sprintId}/delete/`);
      console.log('✅ Sprint deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete sprint:', error.response?.data);
      throw error;
    }
  },

  // ✅ Start sprint
  startSprint: async (sprintId) => {
    console.log('▶️  Starting sprint:', sprintId);
    try {
      const response = await axiosInstance.post(`/sprints/${sprintId}/start/`);
      console.log('✅ Sprint started:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to start sprint:', error.response?.data);
      throw error;
    }
  },

  // ✅ Complete sprint
  completeSprint: async (sprintId) => {
    console.log('✅ Completing sprint:', sprintId);
    try {
      const response = await axiosInstance.post(`/sprints/${sprintId}/complete/`);
      console.log('✅ Sprint completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to complete sprint:', error.response?.data);
      throw error;
    }
  },
};