import axiosInstance from './axios';

export const reportsAPI = {
    // Get project summary report
    getProjectReport: async (projectId) => {
        const response = await axiosInstance.get('/reports/project/', {
            params: { project: projectId }
        });
        return response.data;
    },
};