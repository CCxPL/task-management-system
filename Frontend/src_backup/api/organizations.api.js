import axios from './axios';

export const organizationAPI = {
    // Get all organizations (Super Admin only)
    getOrganizations: () => axios.get('/organizations/'),

    // Create new organization
    createOrganization: (data) => axios.post('/organizations/', data),

    // Update organization status
    updateOrganizationStatus: (orgId, isActive) =>
        axios.patch(`/organizations/${orgId}/`, { is_active: isActive }),

    // Get admins of an organization
    getOrganizationAdmins: (orgId) =>
        axios.get(`/organizations/${orgId}/admins/`),

    // Create new admin in organization
    createOrganizationAdmin: (orgId, adminData) =>
        axios.post(`/organizations/${orgId}/admins/`, adminData),

    // Update admin status
    updateAdminStatus: (orgId, adminId, isActive) =>
        axios.patch(`/organizations/${orgId}/admins/${adminId}/`, {
            is_active: isActive
        })
};