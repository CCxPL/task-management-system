import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
     Snackbar, 
    TableRow,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Alert,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Grid,
    Divider,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Search,
    Edit,
    Visibility,
    Delete,
    Refresh,
    Business,
    CheckCircle,
    Cancel,
    Person,
    Group,
    Email,
    Phone,
    Language,
    LocationOn,
    Warning as WarningIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config/api';

const Organizations = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    // ✅ Snackbar (Toast) state
const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // success | error | warning | info
});
const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
        open: true,
        message,
        severity,
    });
};

const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
};


    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    // ✅ Custom Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        severity: 'error', // error | warning
        onConfirm: null,
    });

    // ✅ Success/Info Dialog State
    const [infoDialog, setInfoDialog] = useState({
        open: false,
        title: '',
        message: '',
        severity: 'success',
    });

    // Create Organization Dialog
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        type: 'COMPANY',
        email: '',
        phone: '',
        domain: '',
        address: '',
    });

    // Organization Details Dialog
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [orgDetails, setOrgDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const organizationTypes = [
        { value: 'COMPANY', label: 'Company' },
        { value: 'INSTITUTE', label: 'Institute' },
        { value: 'SCHOOL', label: 'School' },
    ];

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/organizations/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setOrganizations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Helper: Show confirm dialog
    const showConfirm = (title, message, severity, onConfirm) => {
        setConfirmDialog({ open: true, title, message, severity, onConfirm });
    };

    // ✅ Helper: Show info/success dialog
    const showInfo = (title, message, severity = 'success') => {
        setInfoDialog({ open: true, title, message, severity });
    };

    const handleCreateOrganization = async () => {
        try {
            setCreating(true);
            setError('');

            const token = localStorage.getItem('access_token');

            const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organization: createFormData,
                    admin: {
                        username: createFormData.email.split('@')[0],
                        email: createFormData.email,
                        password: 'TempPass123!',
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization');
            }

            setOpenCreateDialog(false);
            setCreateFormData({ name: '', type: 'COMPANY', email: '', phone: '', domain: '', address: '' });
            fetchOrganizations();

            // ✅ Custom success dialog instead of alert
            showInfo(
                'Organization Created!',
                `Organization "${createFormData.name}" has been created successfully.\n\nAdmin Username: ${data.admin_credentials?.username || createFormData.email.split('@')[0]}\nAdmin Password: ${data.admin_credentials?.password || 'TempPass123!'}`,
                'success'
            );

        } catch (err) {
            showInfo('Failed to Create', err.message, 'error');
        } finally {
            setCreating(false);
        }
    };

    // ✅ Delete with custom confirm dialog
const handleDelete = (org) => {
    showConfirm(
        'Delete Organization',
        `Are you sure you want to delete "${org.name}"? This action cannot be undone.`,
        'error',
        async () => {
            try {
                const token = localStorage.getItem('access_token');

                const response = await fetch(
                    `${API_BASE_URL}/api/organizations/super-admin/organizations/${org.id}/delete/`,
                    {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!response.ok) throw new Error('Failed to delete');

                // ✅ Close confirm dialog
                setConfirmDialog(prev => ({ ...prev, open: false }));

                // ✅ Refresh list
                fetchOrganizations();

                // ✅ SHOW TOAST (TOP RIGHT)
                showSnackbar(`"${org.name}" has been deleted successfully`, 'success');

            } catch (err) {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                showSnackbar(err.message || 'Delete failed', 'error');
            }
        }
    );
};



    // ✅ Toggle status with custom confirm dialog
    const handleToggleStatus = (org) => {
        const newStatus = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const isDeactivating = newStatus === 'INACTIVE';

        showConfirm(
            isDeactivating ? 'Deactivate Organization' : 'Activate Organization',
            isDeactivating
                ? `Are you sure you want to deactivate "${org.name}"? All members of this organization will not be able to login until it is activated again.`
                : `Are you sure you want to activate "${org.name}"? All members will be able to login again.`,
            isDeactivating ? 'warning' : 'info',
            async () => {
                try {
                    const token = localStorage.getItem('access_token');

                    const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/organizations/${org.id}/toggle-status/`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (!response.ok) throw new Error('Failed to toggle status');

                    const data = await response.json();
                    fetchOrganizations();
                    showInfo(
                        isDeactivating ? 'Organization Deactivated' : 'Organization Activated',
                        data.message || `"${org.name}" is now ${newStatus}.`,
                        'success'
                    );
                } catch (err) {
                    showInfo('Status Change Failed', err.message, 'error');
                }
            }
        );
    };

    const handleViewDetails = async (org) => {
        setSelectedOrg(org);
        setOpenDetailsDialog(true);
        setLoadingDetails(true);

        try {
            setOrgDetails(org);
        } catch (err) {
            console.error('Failed to fetch details:', err);
            setOrgDetails(org);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ✅ Color config for dialogs
    const getDialogColors = (severity) => {
        const colors = {
            error:   { icon: '#EF4444', bg: '#FEF2F2', btn: '#EF4444', btnHover: '#DC2626' },
            warning: { icon: '#F59E0B', bg: '#FFFBEB', btn: '#F59E0B', btnHover: '#D97706' },
            info:    { icon: '#3B82F6', bg: '#EFF6FF', btn: '#3B82F6', btnHover: '#2563EB' },
            success: { icon: '#10B981', bg: '#ECFDF5', btn: '#10B981', btnHover: '#059669' },
        };
        return colors[severity] || colors.error;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{
                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        🏢 Organizations
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Manage all organizations
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={fetchOrganizations} title="Refresh">
                        <Refresh />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenCreateDialog(true)}
                        sx={{ background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)' }}
                    >
                        Create Organization
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Search */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                        <TableRow>
                            <TableCell><strong>Organization</strong></TableCell>
                            <TableCell><strong>Type</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Admins</strong></TableCell>
                            <TableCell><strong>Members</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrgs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="textSecondary">No organizations found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrgs.map((org) => (
                                <TableRow key={org.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Business color="primary" />
                                            <Typography variant="body2" fontWeight="500">{org.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={org.type} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={org.status}
                                            size="small"
                                            color={org.status === 'ACTIVE' ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell>{org.admins || 0}</TableCell>
                                    <TableCell>{org.members || 0}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton size="small" onClick={() => handleViewDetails(org)}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => navigate(`/super-admin/organizations/${org.id}/edit`)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(org)}
                                                color={org.status === 'ACTIVE' ? 'error' : 'success'}
                                            >
                                                {org.status === 'ACTIVE' ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => handleDelete(org)} color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ✅ CUSTOM CONFIRM DIALOG */}
            {(() => {
                const c = getDialogColors(confirmDialog.severity);
                return (
                    <Dialog
                        open={confirmDialog.open}
                        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                minWidth: 440,
                                maxWidth: 520,
                                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                            }
                        }}
                        BackdropProps={{
                            sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.4)' }
                        }}
                    >
                        <Box sx={{ height: 4, bgcolor: c.btn }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 3, pt: 3, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: '50%', bgcolor: c.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <WarningIcon sx={{ color: c.icon, fontSize: 24 }} />
                                </Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: isDarkMode ? '#F3F4F6' : '#1F2937' }}>
                                    {confirmDialog.title}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} sx={{ color: '#9CA3AF' }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#6B7280', ml: 7.5, lineHeight: 1.6 }}>
                                {confirmDialog.message}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                                sx={{
                                    borderRadius: 2, px: 4, py: 1, borderColor: '#D1D5DB',
                                    color: isDarkMode ? '#D1D5DB' : '#374151', fontWeight: 500,
                                    '&:hover': { bgcolor: isDarkMode ? '#2C3137' : '#F3F4F6' },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setConfirmDialog({ ...confirmDialog, open: false });
                                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                                }}
                                sx={{
                                    borderRadius: 2, px: 4, py: 1, bgcolor: c.btn, fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: c.btnHover, boxShadow: 'none' },
                                }}
                            >
                                {confirmDialog.severity === 'error' ? 'Delete' : 'Confirm'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            })()}

            {/* ✅ CUSTOM INFO / SUCCESS DIALOG */}
            {(() => {
                const c = getDialogColors(infoDialog.severity);
                return (
                    <Dialog
                        open={infoDialog.open}
                        onClose={() => setInfoDialog({ ...infoDialog, open: false })}
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                minWidth: 440,
                                maxWidth: 520,
                                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                            }
                        }}
                        BackdropProps={{
                            sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.4)' }
                        }}
                    >
                        <Box sx={{ height: 4, bgcolor: c.btn }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 3, pt: 3, pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: '50%', bgcolor: c.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {infoDialog.severity === 'success'
                                        ? <CheckCircle sx={{ color: c.icon, fontSize: 24 }} />
                                        : <WarningIcon sx={{ color: c.icon, fontSize: 24 }} />
                                    }
                                </Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: isDarkMode ? '#F3F4F6' : '#1F2937' }}>
                                    {infoDialog.title}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setInfoDialog({ ...infoDialog, open: false })} sx={{ color: '#9CA3AF' }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#6B7280', ml: 7.5, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                {infoDialog.message}
                            </Typography>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={() => setInfoDialog({ ...infoDialog, open: false })}
                                sx={{
                                    borderRadius: 2, px: 5, py: 1, bgcolor: c.btn, fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: c.btnHover, boxShadow: 'none' },
                                }}
                            >
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            })()}

            {/* Create Organization Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #E0E0E0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business color="primary" />
                        Create New Organization
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required
                                label="Organization Name"
                                value={createFormData.name}
                                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                placeholder="e.g., Acme Corporation"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select fullWidth required
                                label="Organization Type"
                                value={createFormData.type}
                                onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                            >
                                {organizationTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth required type="email"
                                label="Admin Email"
                                value={createFormData.email}
                                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                placeholder="admin@company.com"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={createFormData.phone}
                                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                                placeholder="+1234567890"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Domain"
                                value={createFormData.domain}
                                onChange={(e) => setCreateFormData({ ...createFormData, domain: e.target.value })}
                                placeholder="company.com"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                value={createFormData.address}
                                onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                                placeholder="123 Main St, City"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="info">
                                A temporary admin account will be created with the provided email. Admin credentials will be shown after creation.
                            </Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #E0E0E0', p: 2 }}>
                    <Button onClick={() => setOpenCreateDialog(false)} disabled={creating}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateOrganization}
                        disabled={creating || !createFormData.name || !createFormData.email}
                        startIcon={creating ? <CircularProgress size={20} /> : <Add />}
                    >
                        {creating ? 'Creating...' : 'Create Organization'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Organization Details Dialog */}
            <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #E0E0E0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business color="primary" />
                        Organization Details
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {loadingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : orgDetails ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Organization Information</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Name</Typography>
                                            <Typography variant="body1" fontWeight="500">{orgDetails.name}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Type</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip label={orgDetails.type} variant="outlined" size="small" />
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">Status</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip label={orgDetails.status} color={orgDetails.status === 'ACTIVE' ? 'success' : 'error'} size="small" />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Contact Information</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {orgDetails.email && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Email fontSize="small" color="action" />
                                                <Typography variant="body2">{orgDetails.email}</Typography>
                                            </Box>
                                        )}
                                        {orgDetails.phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Phone fontSize="small" color="action" />
                                                <Typography variant="body2">{orgDetails.phone}</Typography>
                                            </Box>
                                        )}
                                        {orgDetails.domain && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Language fontSize="small" color="action" />
                                                <Typography variant="body2">{orgDetails.domain}</Typography>
                                            </Box>
                                        )}
                                        {orgDetails.address && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOn fontSize="small" color="action" />
                                                <Typography variant="body2">{orgDetails.address}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Statistics</Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                                <Typography variant="h4" fontWeight="bold">{orgDetails.admins || 0}</Typography>
                                                <Typography variant="caption" color="textSecondary">Admins</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <Group sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                                                <Typography variant="h4" fontWeight="bold">{orgDetails.members || 0}</Typography>
                                                <Typography variant="caption" color="textSecondary">Total Members</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #E0E0E0', p: 2 }}>
                    <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => {
                            setOpenDetailsDialog(false);
                            navigate(`/super-admin/organizations/${selectedOrg.id}/edit`);
                        }}
                    >
                        Edit Organization
                    </Button>
                </DialogActions>
            </Dialog>
            {/* 🔔 TOP-RIGHT TOAST NOTIFICATION */}
<Snackbar
    open={snackbar.open}
    autoHideDuration={3000}
    onClose={closeSnackbar}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
    <Alert
        onClose={closeSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            fontWeight: 500,
        }}
    >
        {snackbar.message}
    </Alert>
</Snackbar>

        </Box>
    );
};

export default Organizations;