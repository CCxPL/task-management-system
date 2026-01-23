import axiosInstance from './axios.js';

export const sprintsAPI = {

  // ✅ Create sprint
  createSprint: async (sprintData) => {
    const response = await axiosInstance.post(
      '/sprints/',
      sprintData
    );
    return response;
  },

  // ✅ Get sprints for a project
  getSprintsByProject: async (projectId) => {
    const response = await axiosInstance.get(
      '/sprints/',
      { params: { project: projectId } }
    );
    return response;
  },

  // ✅ Get sprint by ID
  getSprintById: async (sprintId) => {
    const response = await axiosInstance.get(
      `/sprints/${sprintId}/`
    );
    return response;
  },
};
