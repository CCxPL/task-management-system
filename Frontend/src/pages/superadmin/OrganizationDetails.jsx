import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    Alert,
    Divider,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Business,
    Email,
    Phone,
    Language,
    LocationOn,
    Person,
    Group,
    AdminPanelSettings,
    CheckCircle,
    Cancel,
    LockReset,
    ContentCopy,
    Warning as WarningIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config/api';

const OrganizationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [org, setOrg] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Reset password dialog
    const [resetDialog, setResetDialog] = useState({
        open: false,
        admin: null,
        loading: false,
    });
    
    // Success dialog for new password
    const [passwordDialog, setPasswordDialog] = useState({
        open: false,
        username: '',
        email: '',
        password: '',
    });

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchOrganization();
        fetchAdmins();
    }, [id]);

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            
            const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/organizations/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const organization = data.find(o => o.id === parseInt(id));
            
            if (!organization) throw new Error('Organization not found');
            
            setOrg(organization);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/organizations/${id}/admins/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            }
        } catch (err) {
            console.error('Failed to fetch admins:', err);
        }
    };

    const handleResetPassword = (admin) => {
        setResetDialog({
            open: true,
            admin: admin,
            loading: false,
        });
    };

    const confirmResetPassword = async () => {
        try {
            setResetDialog(prev => ({ ...prev, loading: true }));
            const token = localStorage.getItem('access_token');

            const response = await fetch(
                `${API_BASE_URL}/api/organizations/super-admin/organizations/${id}/admins/${resetDialog.admin.id}/reset-password/`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (!response.ok) throw new Error('Failed to reset password');

            const data = await response.json();

            // Close reset dialog
            setResetDialog({ open: false, admin: null, loading: false });

            // Show password in dialog
            setPasswordDialog({
                open: true,
                username: data.username,
                email: data.email,
                password: data.new_password,
            });

            setSnackbar({
                open: true,
                message: 'Password reset successfully!',
                severity: 'success',
            });

        } catch (err) {
            setSnackbar({
                open: true,
                message: err.message || 'Failed to reset password',
                severity: 'error',
            });
            setResetDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSnackbar({
            open: true,
            message: 'Copied to clipboard!',
            severity: 'success',
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !org) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Organization not found'}</Alert>
                <Button onClick={() => navigate('/super-admin/dashboard')} sx={{ mt: 2 }}>
                    Back to Dashboard
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#F4F5F7' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <IconButton onClick={() => navigate('/super-admin/dashboard')}>
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                        {org.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Organization Details
                    </Typography>
                </Box>
                <Chip
                    label={org.status}
                    color={org.status === 'ACTIVE' ? 'success' : 'error'}
                />
                <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/super-admin/organizations/${id}/edit`)}
                    sx={{
                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                    }}
                >
                    Edit
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Organization Info */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business color="primary" />
                            Organization Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    Organization Name
                                </Typography>
                                <Typography variant="body1" fontWeight="500">
                                    {org.name}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    Type
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip label={org.type} variant="outlined" />
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    Created
                                </Typography>
                                <Typography variant="body2">
                                    {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Contact Info */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Contact Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {org.email ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Email fontSize="small" color="action" />
                                    <Typography variant="body2">{org.email}</Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">No email provided</Typography>
                            )}

                            {org.phone ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Phone fontSize="small" color="action" />
                                    <Typography variant="body2">{org.phone}</Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">No phone provided</Typography>
                            )}

                            {org.domain ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Language fontSize="small" color="action" />
                                    <Typography variant="body2">{org.domain}</Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">No domain provided</Typography>
                            )}

                            {org.address ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOn fontSize="small" color="action" />
                                    <Typography variant="body2">{org.address}</Typography>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">No address provided</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Statistics
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}>
                                    <AdminPanelSettings sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        {org.admins || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Admins
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #E0E0E0', borderRadius: 2 }}>
                                    <Group sx={{ fontSize: 40, color: '#8B5CF6', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold">
                                        {org.members || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Total Members
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Admins List */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="primary" />
                                Organization Admins ({admins.length})
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {admins.length === 0 ? (
                            <Alert severity="info">No admins found for this organization</Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#F4F5F7' }}>
                                        <TableRow>
                                            <TableCell><strong>Admin</strong></TableCell>
                                            <TableCell><strong>Email</strong></TableCell>
                                            <TableCell><strong>Role</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell><strong>Joined</strong></TableCell>
                                            <TableCell align="right"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {admins.map((admin) => (
                                            <TableRow key={admin.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#3B82F6' }}>
                                                            {admin.username?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight="500">
                                                            {admin.username}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{admin.email}</TableCell>
                                                <TableCell>
                                                    <Chip label={admin.role} size="small" variant="outlined" color="primary" />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={admin.is_active ? 'Active' : 'Inactive'}
                                                        size="small"
                                                        icon={admin.is_active ? <CheckCircle /> : <Cancel />}
                                                        color={admin.is_active ? 'success' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {admin.joined_at ? new Date(admin.joined_at).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<LockReset />}
                                                        onClick={() => handleResetPassword(admin)}
                                                        sx={{ fontSize: '0.75rem' }}
                                                    >
                                                        Reset Password
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Reset Password Confirm Dialog */}
            <Dialog
                open={resetDialog.open}
                onClose={() => !resetDialog.loading && setResetDialog({ open: false, admin: null, loading: false })}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 440,
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    }
                }}
            >
                <Box sx={{ height: 4, bgcolor: '#F59E0B' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 3, pt: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 44, height: 44, borderRadius: '50%', bgcolor: '#FFFBEB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <WarningIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="600">
                            Reset Admin Password
                        </Typography>
                    </Box>
                    <IconButton 
                        size="small" 
                        onClick={() => setResetDialog({ open: false, admin: null, loading: false })}
                        disabled={resetDialog.loading}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', ml: 7.5, lineHeight: 1.6 }}>
                        Are you sure you want to reset the password for <strong>{resetDialog.admin?.username}</strong>?
                        <br /><br />
                        A new random password will be generated and displayed. Please save it securely.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setResetDialog({ open: false, admin: null, loading: false })}
                        disabled={resetDialog.loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={confirmResetPassword}
                        disabled={resetDialog.loading}
                        sx={{
                            bgcolor: '#F59E0B',
                            '&:hover': { bgcolor: '#D97706' },
                        }}
                    >
                        {resetDialog.loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* New Password Display Dialog */}
            <Dialog
                open={passwordDialog.open}
                onClose={() => setPasswordDialog({ open: false, username: '', email: '', password: '' })}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 500,
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    }
                }}
            >
                <Box sx={{ height: 4, bgcolor: '#10B981' }} />
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ color: '#10B981' }} />
                        Password Reset Successfully
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Password has been reset. Please save these credentials securely!
                    </Alert>

                    <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                            Username
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body1" fontWeight="500" sx={{ flex: 1 }}>
                                {passwordDialog.username}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(passwordDialog.username)}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                            Email
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body1" fontWeight="500" sx={{ flex: 1 }}>
                                {passwordDialog.email}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(passwordDialog.email)}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ bgcolor: '#FEF2F2', p: 2, borderRadius: 2, border: '1px solid #FCA5A5' }}>
                        <Typography variant="caption" color="error">
                            New Password
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body1" fontWeight="600" sx={{ flex: 1, fontFamily: 'monospace' }}>
                                {passwordDialog.password}
                            </Typography>
                            <IconButton size="small" color="error" onClick={() => copyToClipboard(passwordDialog.password)}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => setPasswordDialog({ open: false, username: '', email: '', password: '' })}
                        fullWidth
                        sx={{
                            bgcolor: '#10B981',
                            '&:hover': { bgcolor: '#059669' },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationDetails;