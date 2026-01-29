import axiosInstance from './axios.js';

export const issuesAPI = {
    getIssues: async (projectId) => {
        if (!projectId) {
            throw new Error("projectId is required to fetch issues");
        }

        return axiosInstance.get('/issues/', {
            params: { project: projectId },
        });
    },


    createIssue: async (data) => {
        try {
            console.log('📝 Creating issue with data:', data);
            const response = await axiosInstance.post('/issues/', data);
            console.log('✅ Issue created successfully:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Error creating issue:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

// issues.api.js
updateIssueStatus: async (issueId, status) => {
    try {
        console.log(`🔄 Updating issue ${issueId} status to:`, status);
        const response = await axiosInstance.patch(`/issues/${issueId}/status/`, { status });  // ✅ ADD /status/
        console.log('✅ Issue status updated successfully:', response.data);
        return response.data;  // ✅ Return data directly
    } catch (error) {
        console.error('❌ Error updating issue status:', error);
        console.error('❌ Error response:', error.response?.data);
        throw error;
    }
},

    getIssueById: async (id) => {
        try {
            console.log('🔍 Fetching issue by ID:', id);
            const response = await axiosInstance.get(`/issues/${id}/`);
            console.log('✅ Issue fetched successfully:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Error fetching issue by ID:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

    // ✅ Bonus: Additional helpful methods
    updateIssue: async (issueId, data) => {
        try {
            console.log(`📝 Updating issue ${issueId} with data:`, data);
            const response = await axiosInstance.patch(`/issues/${issueId}/`, data);
            console.log('✅ Issue updated successfully:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Error updating issue:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

    deleteIssue: async (issueId) => {
        try {
            console.log(`🗑️ Deleting issue ${issueId}`);
            const response = await axiosInstance.delete(`/issues/${issueId}/`);
            console.log('✅ Issue deleted successfully');
            return response;
        } catch (error) {
            console.error('❌ Error deleting issue:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },

    assignIssue: async (issueId, assigneeId) => {
        try {
            console.log(`👤 Assigning issue ${issueId} to user ${assigneeId}`);
            const response = await axiosInstance.patch(`/issues/${issueId}/`, {
                assignee: assigneeId
            });
            console.log('✅ Issue assigned successfully:', response.data);
            return response;
        } catch (error) {
            console.error('❌ Error assigning issue:', error);
            console.error('❌ Error response:', error.response?.data);
            throw error;
        }
    },
};