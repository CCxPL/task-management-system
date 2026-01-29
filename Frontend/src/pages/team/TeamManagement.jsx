import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import {
  fetchTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../../app/slices/teamSlice';

import { getRoleDisplayName } from '../../utils/roleHelpers';

const TeamManagement = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { user } = useSelector((state) => state.auth);
  const { list: teamMembers, loading } = useSelector((state) => state.team);

  const orgType = user?.organization?.type || 'COMPANY';

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: orgType === 'INSTITUTE' ? 'STUDENT' : 'MEMBER',
    password: '',
  });

  // ✅ ADD ERROR HELPER FUNCTION
  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    
    // Handle Redux rejected action with error object
    if (err?.error && typeof err.error === 'string') {
      return err.error;
    }
    
    // Handle error.response.data structure from API
    if (err?.response?.data) {
      const data = err.response.data;
      
      // Handle {error: "message", details: [...]}
      if (data.error && data.details) {
        return `${data.error}: ${data.details.join(', ')}`;
      }
      
      // Handle {error: "message"}
      if (data.error) {
        return data.error;
      }
      
      // Handle other structures
      return JSON.stringify(data);
    }
    
    // Handle error.message
    if (err?.message) {
      return err.message;
    }
    
    return 'An error occurred';
  };

  // 🔹 Fetch team on page load
  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  // 🔹 Filter team
  const filteredTeam = (teamMembers || []).filter((member) =>
    (member.name || member.user?.username || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (member.email || member.user?.email || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const teamLabel = orgType === 'INSTITUTE' ? 'Students' : 'Team Members';
  const memberLabel = orgType === 'INSTITUTE' ? 'Student' : 'Member';

  // 🔹 Handle form change
  const handleChange = (e) => {
    setMemberForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // 🔹 Open Add Dialog
  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setSelectedMember(null);
    setMemberForm({
      name: '',
      email: '',
      role: orgType === 'INSTITUTE' ? 'STUDENT' : 'MEMBER',
      password: '',
    });
    setError('');
    setOpenDialog(true);
  };

  // 🔹 Open Edit Dialog
  const handleOpenEditDialog = (member) => {
    console.log('✏️ Edit member:', member);
    setIsEditMode(true);
    setSelectedMember(member);
    setMemberForm({
      name: member.name || member.user?.username || '',
      email: member.email || member.user?.email || '',
      role: member.role || 'MEMBER',
      password: '', // Don't pre-fill password for security
    });
    setError('');
    setOpenDialog(true);
  };

  // 🔹 Open Delete Dialog
  const handleOpenDeleteDialog = (member) => {
    console.log('🗑️ Delete member:', member);
    setSelectedMember(member);
    setOpenDeleteDialog(true);
  };

  // 🔹 Create/Update Member
  const handleSubmit = async () => {
    try {
      setError('');
      
      if (isEditMode) {
        // ✅ UPDATE MEMBER
        console.log('📝 Updating member:', selectedMember.id);
        const updateData = {
          username: memberForm.name, // ✅ Changed to match backend
          role: memberForm.role,
        };
        
        // Only include password if it was changed
        if (memberForm.password) {
          updateData.password = memberForm.password;
        }
        
        await dispatch(updateTeamMember({
          memberId: selectedMember.id,
          data: updateData,
        })).unwrap();
        
        setSuccess('Member updated successfully!');
        console.log('✅ Member updated');
      } else {
        // ✅ CREATE MEMBER
        console.log('📝 Creating new member');
        const createData = {
          username: memberForm.name, // ✅ Changed to match backend
          email: memberForm.email,
          role: memberForm.role,
          password: memberForm.password,
        };
        
        await dispatch(addTeamMember(createData)).unwrap();
        setSuccess('Member added successfully!');
        console.log('✅ Member created');
      }
      
      setOpenDialog(false);
      setMemberForm({
        name: '',
        email: '',
        role: orgType === 'INSTITUTE' ? 'STUDENT' : 'MEMBER',
        password: '',
      });
      
      // Refresh list
      dispatch(fetchTeamMembers());
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Failed to save member:', err);
      setError(getErrorMessage(err)); // ✅ USE HELPER FUNCTION
    }
  };

  // 🔹 Delete Member
  const handleDeleteConfirm = async () => {
    try {
      setError('');
      console.log('🗑️ Deleting member:', selectedMember.id);
      
      await dispatch(deleteTeamMember(selectedMember.id)).unwrap();
      
      setSuccess('Member deleted successfully!');
      console.log('✅ Member deleted');
      
      setOpenDeleteDialog(false);
      setSelectedMember(null);
      
      // Refresh list
      dispatch(fetchTeamMembers());
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('❌ Failed to delete member:', err);
      setError(getErrorMessage(err)); // ✅ USE HELPER FUNCTION
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Success Alert */}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* Error Alert */}
      {error && !openDialog && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="700"
            sx={{
              background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {teamLabel} Management
          </Typography>
          <Typography color="textSecondary">
            {user?.organization?.name}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #2563EB 30%, #7C3AED 90%)',
            }
          }}
        >
          Add {memberLabel}
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${teamLabel.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />
      </Paper>

      {/* Table */}
      <TableContainer 
        component={Paper}
        sx={{ 
          borderRadius: '12px',
          bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
        }}
      >
        {loading ? (
          <Box p={3} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTeam.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No {teamLabel.toLowerCase()} found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeam.map((member) => (
                  <TableRow 
                    key={member.id || member.email} 
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: isDarkMode ? '#22272B' : '#F8FAFF',
                      }
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="500">
                        {member.name || member.username || member.user?.username || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {member.email || member.user?.email || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleDisplayName(member.role, orgType)}
                        size="small"
                        color={
                          member.role === 'MANAGER' || member.role === 'TEACHER'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                        color={member.is_active !== false ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(member)}
                        sx={{
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(member)}
                        sx={{
                          ml: 1,
                          '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Add/Edit Member Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {isEditMode ? `Edit ${memberLabel}` : `Add New ${memberLabel}`}
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={memberForm.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={memberForm.email}
                onChange={handleChange}
                required
                disabled={isEditMode}
                helperText={isEditMode ? "Email cannot be changed" : ""}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isEditMode ? "New Password (optional)" : "Password"}
                name="password"
                type="password"
                value={memberForm.password}
                onChange={handleChange}
                required={!isEditMode}
                helperText={isEditMode ? "Leave blank to keep current password" : "Minimum 6 characters"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={memberForm.role}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              >
                {orgType === 'INSTITUTE' ? (
                  <>
                    <MenuItem value="TEACHER">Teacher</MenuItem>
                    <MenuItem value="STUDENT">Student</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="MANAGER">Manager</MenuItem>
                    <MenuItem value="MEMBER">Member</MenuItem>
                  </>
                )}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setError('');
            }}
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !memberForm.name || 
              !memberForm.email || 
              (!isEditMode && !memberForm.password)
            }
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563EB 30%, #7C3AED 90%)',
              }
            }}
          >
            {isEditMode ? 'Update' : 'Add'} {memberLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete {memberLabel}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>
              {selectedMember?.name || selectedMember?.username || selectedMember?.user?.username}
            </strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Warning: This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagement;