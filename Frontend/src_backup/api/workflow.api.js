import axiosInstance from './axios';

export const workflowAPI = {
    // Get workflow statuses
    getWorkflowStatuses: async (projectId) => {
        const response = await axiosInstance.get(`/workflow/statuses/?project=${projectId}`);
        return response.data;
    },

    // Create workflow status
    createWorkflowStatus: async (statusData) => {
        const response = await axiosInstance.post('/workflow/statuses/', statusData);
        return response.data;
    },

    // Update workflow status
    updateWorkflowStatus: async (statusId, statusData) => {
        const response = await axiosInstance.patch(`/workflow/statuses/${statusId}/`, statusData);
        return response.data;
    },

    // Delete workflow status
    deleteWorkflowStatus: async (statusId) => {
        const response = await axiosInstance.delete(`/workflow/statuses/${statusId}/`);
        return response.data;
    },

    // ✅ UPDATE COLUMNS ORDER
    updateColumnsOrder: async (projectId, orderData) => {
        console.log('📝 Updating columns order:', orderData);
        const response = await axiosInstance.post(`/workflow/statuses/reorder/`, {
            project: projectId,
            order: orderData,  // [{ id: 1, order: 1 }, { id: 2, order: 2 }, ...]
        });
        return response.data;
    },

    // Get workflow transitions
    getWorkflowTransitions: async (projectId) => {
        const response = await axiosInstance.get(`/workflow/transitions/?project=${projectId}`);
        return response.data;
    },
};