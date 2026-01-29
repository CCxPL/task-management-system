import axiosInstance from './axios';

export const teamAPI = {
  // ✅ Get all team members
  getTeamMembers: async () => {
    console.log('📥 Fetching team members...');
    try {
      const response = await axiosInstance.get('/accounts/team/');
      console.log('✅ Team members fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch team members:', error.response?.data);
      throw error;
    }
  },

  // ✅ Add team member
  addTeamMember: async (memberData) => {
    console.log('📝 Creating team member:', memberData);
    try {
      const response = await axiosInstance.post('/accounts/create-org-user/', {
        username: memberData.name,
        email: memberData.email,
        password: memberData.password,
        role: memberData.role,
      });
      console.log('✅ Team member created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create team member:', error.response?.data);
      throw error;
    }
  },

  // ✅ Update team member
  updateTeamMember: async (memberId, data) => {
    console.log('📝 Updating team member:', memberId, data);
    try {
      const response = await axiosInstance.patch(`/accounts/team/${memberId}/`, {
        username: data.name,
        role: data.role,
        // Only include password if provided
        ...(data.password && { password: data.password }),
      });
      console.log('✅ Team member updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update team member:', error.response?.data);
      throw error;
    }
  },

  // ✅ Delete team member
  deleteTeamMember: async (memberId) => {
    console.log('🗑️  Deleting team member:', memberId);
    try {
      const response = await axiosInstance.delete(`/accounts/team/${memberId}/delete/`);
      console.log('✅ Team member deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete team member:', error.response?.data);
      throw error;
    }
  },
};