import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Card,
    CardContent,
    useTheme,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    Security as SecurityIcon,
    CalendarToday as CalendarIcon,
    Lock as LockIcon,
    Edit as EditIcon,
    Verified as VerifiedIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { updateTeamMember } from '../../app/slices/teamSlice';

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    // Password Update State
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // ✅ Profile Edit State
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
    });
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    if (!user) {
        return (
            <Box textAlign="center" py={8}>
                <Typography variant="h5" color="textSecondary">
                    Please login to view profile
                </Typography>
            </Box>
        );
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'ORG_ADMIN': return 'error';
            case 'MANAGER': return 'warning';
            case 'MEMBER': return 'success';
            case 'TEACHER': return 'warning';
            case 'STUDENT': return 'info';
            default: return 'default';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN':
            case 'ORG_ADMIN':
                return '👑';
            case 'MANAGER':
            case 'TEACHER':
                return '⭐';
            case 'MEMBER':
            case 'STUDENT':
                return '👤';
            default:
                return '👤';
        }
    };

    // Error Helper Function
    const getErrorMessage = (err) => {
        console.log('🔍 Parsing error:', err);
        
        if (typeof err === 'string') return err;
        
        if (err?.error && typeof err.error === 'string') {
            return err.error;
        }
        
        if (err?.response?.data) {
            const data = err.response.data;
            
            if (data.error && data.details) {
                return `${data.error}: ${Array.isArray(data.details) ? data.details.join(', ') : data.details}`;
            }
            
            if (data.error) {
                return data.error;
            }
            
            if (typeof data === 'object') {
                const messages = Object.entries(data)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join('; ');
                return messages || 'Validation error';
            }
            
            return JSON.stringify(data);
        }
        
        if (err?.message) {
            return err.message;
        }
        
        return 'An error occurred';
    };

    // ✅ Edit Profile Handlers
    const handleOpenEditDialog = () => {
        setEditData({
            username: user.username || '',
            email: user.email || '',
        });
        setEditError('');
        setEditSuccess('');
        setOpenEditDialog(true);
    };

    const handleEditChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value,
        });
        setEditError('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError('');
        setEditSuccess('');

        // Validation
        if (!editData.username || !editData.email) {
            setEditError('Username and email are required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editData.email)) {
            setEditError('Please enter a valid email address');
            return;
        }

        setEditLoading(true);

        try {
            console.log('📝 Updating profile for user:', user.id);
            
            const userId = user.user_id || user.id;
            
            const updatePayload = {
                username: editData.username,
                email: editData.email,
            };
            
            console.log('📤 Sending payload:', updatePayload);
            
            await dispatch(updateTeamMember({
                memberId: userId,
                data: updatePayload,
            })).unwrap();

            console.log('✅ Profile updated successfully');
            
            setEditSuccess('Profile updated successfully!');
            
            setTimeout(() => {
                setOpenEditDialog(false);
                setEditSuccess('');
            }, 2000);
        } catch (error) {
            console.error('❌ Profile update error:', error);
            setEditError(getErrorMessage(error));
        } finally {
            setEditLoading(false);
        }
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditData({
            username: '',
            email: '',
        });
        setEditError('');
        setEditSuccess('');
    };

    // Password Update Handlers
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
        setPasswordError('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setPasswordLoading(true);

        try {
            console.log('📝 Updating password for user:', user.id);
            console.log('User object:', user);
            
            const userId = user.user_id || user.id;
            
            console.log('Using user ID:', userId);
            
            const updatePayload = {
                password: passwordData.newPassword,
            };
            
            console.log('📤 Sending payload:', updatePayload);
            
            await dispatch(updateTeamMember({
                memberId: userId,
                data: updatePayload,
            })).unwrap();

            console.log('✅ Password updated successfully');
            
            setPasswordSuccess('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            
            setTimeout(() => {
                setOpenPasswordDialog(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (error) {
            console.error('❌ Password update error:', error);
            console.error('Error details:', {
                response: error.response,
                data: error.response?.data,
                status: error.response?.status,
            });
            setPasswordError(getErrorMessage(error));
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleClosePasswordDialog = () => {
        setOpenPasswordDialog(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const getPermissionsList = (role) => {
        const permissions = {
            ADMIN: [
                'Create/Edit Projects',
                'Manage Users',
                'View All Reports',
                'Full System Access',
                'Delete Resources',
                'Manage Organization',
            ],
            ORG_ADMIN: [
                'Create/Edit Projects',
                'Manage Users',
                'View All Reports',
                'Full System Access',
                'Delete Resources',
                'Manage Organization',
            ],
            MANAGER: [
                'Create/Edit Projects',
                'Manage Sprints',
                'Assign Tasks',
                'View Reports',
                'Edit Team Tasks',
                'Track Progress',
            ],
            TEACHER: [
                'Create/Edit Projects',
                'Manage Assignments',
                'Grade Students',
                'View Reports',
                'Track Student Progress',
                'Manage Classes',
            ],
            MEMBER: [
                'View Assigned Tasks',
                'Update Task Status',
                'Log Time',
                'Add Comments',
                'Upload Attachments',
                'Collaborate with Team',
            ],
            STUDENT: [
                'View Assignments',
                'Submit Work',
                'View Grades',
                'Add Comments',
                'Upload Attachments',
                'Track Progress',
            ],
        };
        return permissions[role] || [];
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    sx={{ 
                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                    }}
                >
                    My Profile
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Manage your account settings and preferences
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Profile Card */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            borderRadius: '16px',
                            background: isDarkMode 
                                ? 'linear-gradient(135deg, #1D2125 0%, #2D3139 100%)'
                                : 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                            border: `1px solid ${isDarkMode ? '#2D3139' : '#E0E0E0'}`,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Decorative Background */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '120px',
                                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                opacity: 0.1,
                            }}
                        />

                        {/* Avatar */}
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    fontSize: 48,
                                    background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                    mx: 'auto',
                                    border: `4px solid ${isDarkMode ? '#1D2125' : '#FFFFFF'}`,
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                }}
                            >
                                {user.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: '50%',
                                    transform: 'translateX(50%)',
                                    mr: -8,
                                }}
                            >
                                <VerifiedIcon 
                                    sx={{ 
                                        color: '#3B82F6',
                                        fontSize: 32,
                                        background: isDarkMode ? '#1D2125' : '#FFFFFF',
                                        borderRadius: '50%',
                                    }} 
                                />
                            </Box>
                        </Box>

                        {/* Name */}
                        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                            {user.username}
                        </Typography>

                        {/* Role Badge */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                            <Typography fontSize="1.5rem">
                                {getRoleIcon(user.role)}
                            </Typography>
                            <Chip
                                label={user.role}
                                color={getRoleColor(user.role)}
                                sx={{ 
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                }}
                            />
                        </Box>

                        {/* Email */}
                        <Typography color="textSecondary" sx={{ mb: 3 }}>
                            {user.email}
                        </Typography>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Button
                                variant="contained"
                                startIcon={<LockIcon />}
                                onClick={() => setOpenPasswordDialog(true)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #2563EB 30%, #7C3AED 90%)',
                                    }
                                }}
                            >
                                Change Password
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleOpenEditDialog}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Paper>

                    {/* Quick Stats Card */}
                    <Card 
                        elevation={0}
                        sx={{ 
                            mt: 3,
                            borderRadius: '16px',
                            border: `1px solid ${isDarkMode ? '#2D3139' : '#E0E0E0'}`,
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Account Stats
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {user.projects_count || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Projects
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        {user.tasks_count || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Tasks
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Details */}
                <Grid item xs={12} md={8}>
                    {/* Account Information */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, 
                            mb: 3,
                            borderRadius: '16px',
                            border: `1px solid ${isDarkMode ? '#2D3139' : '#E0E0E0'}`,
                        }}
                    >
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            📋 Account Information
                        </Typography>

                        <List sx={{ '& .MuiListItem-root': { py: 2 } }}>
                            <ListItem>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                        mr: 2,
                                    }}
                                >
                                    <PersonIcon sx={{ color: 'white' }} />
                                </Box>
                                <ListItemText
                                    primary={
                                        <Typography variant="caption" color="textSecondary">
                                            Username
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body1" fontWeight="medium">
                                            {user.username}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <Divider />

                            <ListItem>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(45deg, #10B981 30%, #059669 90%)',
                                        mr: 2,
                                    }}
                                >
                                    <EmailIcon sx={{ color: 'white' }} />
                                </Box>
                                <ListItemText
                                    primary={
                                        <Typography variant="caption" color="textSecondary">
                                            Email Address
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body1" fontWeight="medium">
                                            {user.email}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            <Divider />

                            <ListItem>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(45deg, #F59E0B 30%, #D97706 90%)',
                                        mr: 2,
                                    }}
                                >
                                    <SecurityIcon sx={{ color: 'white' }} />
                                </Box>
                                <ListItemText
                                    primary={
                                        <Typography variant="caption" color="textSecondary">
                                            Role & Access Level
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={user.role}
                                                color={getRoleColor(user.role)}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    }
                                />
                            </ListItem>
                            <Divider />

                            {user.organization && (
                                <>
                                    <ListItem>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(45deg, #8B5CF6 30%, #7C3AED 90%)',
                                                mr: 2,
                                            }}
                                        >
                                            <BusinessIcon sx={{ color: 'white' }} />
                                        </Box>
                                        <ListItemText
                                            primary={
                                                <Typography variant="caption" color="textSecondary">
                                                    Organization
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body1" fontWeight="medium">
                                                    {user.organization.name}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <Divider />
                                </>
                            )}

                            <ListItem>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(45deg, #06B6D4 30%, #0891B2 90%)',
                                        mr: 2,
                                    }}
                                >
                                    <CalendarIcon sx={{ color: 'white' }} />
                                </Box>
                                <ListItemText
                                    primary={
                                        <Typography variant="caption" color="textSecondary">
                                            Member Since
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body1" fontWeight="medium">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })
                                                : 'Unknown'
                                            }
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Permissions Summary */}
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3,
                            borderRadius: '16px',
                            border: `1px solid ${isDarkMode ? '#2D3139' : '#E0E0E0'}`,
                        }}
                    >
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                            🔐 Your Permissions
                        </Typography>
                        <Typography color="textSecondary" paragraph>
                            Based on your <strong>{user.role}</strong> role, you have access to:
                        </Typography>

                        <Grid container spacing={1.5}>
                            {getPermissionsList(user.role).map((permission, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Chip
                                        label={permission}
                                        color="success"
                                        variant="outlined"
                                        icon={<VerifiedIcon />}
                                        sx={{
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            py: 2.5,
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            borderRadius: '8px',
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* ✅ Edit Profile Dialog */}
            <Dialog 
                open={openEditDialog} 
                onClose={handleCloseEditDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Edit Profile
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseEditDialog} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleEditSubmit}>
                    <DialogContent>
                        {editError && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                                {editError}
                            </Alert>
                        )}

                        {editSuccess && (
                            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                                {editSuccess}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={editData.username}
                            onChange={handleEditChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            type="email"
                            label="Email Address"
                            name="email"
                            value={editData.email}
                            onChange={handleEditChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button 
                            onClick={handleCloseEditDialog}
                            disabled={editLoading}
                            sx={{ 
                                borderRadius: '8px',
                                textTransform: 'none',
                                px: 3,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={editLoading}
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
                            {editLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Password Change Dialog */}
            <Dialog 
                open={openPasswordDialog} 
                onClose={handleClosePasswordDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Change Password
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClosePasswordDialog} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handlePasswordSubmit}>
                    <DialogContent>
                        {passwordError && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                                {passwordError}
                            </Alert>
                        )}

                        {passwordSuccess && (
                            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                                {passwordSuccess}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            type="password"
                            label="Current Password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            margin="normal"
                            helperText="Must be at least 6 characters"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm New Password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
                        />
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button 
                            onClick={handleClosePasswordDialog}
                            disabled={passwordLoading}
                            sx={{ 
                                borderRadius: '8px',
                                textTransform: 'none',
                                px: 3,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={passwordLoading}
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
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Profile;