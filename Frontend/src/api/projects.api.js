// api/projects.api.js
import axiosInstance from './axios.js';

export const projectsAPI = {

  // ✅ Get all projects
  getProjects: async () => {
    console.log('📥 Fetching projects...');
    try {
      const response = await axiosInstance.get('/projects/');
      console.log('✅ Projects fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error.response?.data);
      throw error;
    }
  },

  // ✅ Create new project - FIXED ENDPOINT
  createProject: async (projectData) => {
    console.log('📝 Creating project:', projectData);
    try {
      const response = await axiosInstance.post('/projects/create/', {
        name: projectData.name,
        key: projectData.key,
        description: projectData.description || '',
      });
      console.log('✅ Project created:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to create project:', error.response?.data);
      throw error;
    }
  },

  // ✅ Get single project
  getProjectById: async (projectId) => {
    console.log('📥 Fetching project:', projectId);
    try {
      const response = await axiosInstance.get(`/projects/${projectId}/`);
      console.log('✅ Project fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch project:', error.response?.data);
      throw error;
    }
  },

  // ✅ Update project
  updateProject: async (projectId, projectData) => {
    console.log('📝 Updating project:', projectId);
    try {
      const response = await axiosInstance.patch(
        `/projects/${projectId}/`,
        projectData
      );
      console.log('✅ Project updated:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Failed to update project:', error.response?.data);
      throw error;
    }
  },
};