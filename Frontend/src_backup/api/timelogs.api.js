import axiosInstance from './axios';

export const timelogsAPI = {
    // Log time on issue
    createTimelog: async (timelogData) => {
        const response = await axiosInstance.post('/timelogs/', timelogData);
        return response.data;
    },

    // Get timelogs for an issue
    getTimelogsByIssue: async (issueId) => {
        const response = await axiosInstance.get('/timelogs/', { params: { issue: issueId } });
        return response.data;
    },
};