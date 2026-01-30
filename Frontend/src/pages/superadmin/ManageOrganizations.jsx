import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
} from '@mui/material';
import {
    Business,
    Edit,
    Delete,
    Add,
    Visibility,
    CheckCircle,
    Cancel,
    Person,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const ManageOrganizations = () => {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState('create');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [expandedOrg, setExpandedOrg] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'COMPANY',
        status: 'ACTIVE',
    });

    // RESPONSIVE HOOKS
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    // RESPONSIVE STYLES
    const styles = {
        container: {
            padding: isMobile ? '16px' : '24px',
            maxWidth: '100%',
            overflowX: 'hidden',
        },
        header: {
            padding: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #C1C7D0',
            backgroundColor: '#FFFFFF',
        },
        headerContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '32px',
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '16px',
        },
        headerIcon: {
            fontSize: isMobile ? '28px' : '32px',
            color: 'primary.main',
        },
        headerText: {
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
        },
        headerSubtext: {
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: 'text.secondary',
        },
        addButton: {
            minHeight: '44px',
            fontSize: isMobile ? '14px' : '16px',
            width: isMobile ? '100%' : 'auto',
        },
        orgCard: {
            marginBottom: '16px',
            border: '1.5px solid #C1C7D0',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
        },
        orgCardHeader: {
            padding: isMobile ? '12px' : '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: '#F4F5F7',
        },
        orgCardContent: {
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderTop: '1px solid #C1C7D0',
        },
        orgInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px',
            flexWrap: 'wrap',
        },
        orgName: {
            fontSize: isMobile ? '1rem' : '1.125rem',
            fontWeight: '600',
        },
        orgTypeChip: {
            height: isMobile ? '20px' : '24px',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
        },
        orgStatusChip: {
            height: isMobile ? '20px' : '24px',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
        },
        actionButtons: {
            display: 'flex',
            gap: isMobile ? '4px' : '8px',
        },
        actionIcon: {
            fontSize: isMobile ? '18px' : '20px',
        },
        statsGrid: {
            padding: isMobile ? '12px' : '16px',
            borderTop: '1px solid #C1C7D0',
            backgroundColor: '#F4F5F7',
        },
        statItem: {
            textAlign: 'center',
            padding: isMobile ? '8px' : '12px',
        },
        statValue: {
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
        },
        statLabel: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            color: 'text.secondary',
        },
        dialogPaper: {
            margin: isMobile ? '16px' : '32px',
            width: isMobile ? 'calc(100% - 32px)' : '500px',
            maxWidth: '100%',
        },
        dialogTitle: {
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            padding: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #C1C7D0',
        },
        dialogContent: {
            padding: isMobile ? '16px' : '24px',
        },
        dialogActions: {
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderTop: '1px solid #C1C7D0',
        },
        formField: {
            marginBottom: isMobile ? '12px' : '16px',
            '& .MuiInputBase-root': {
                fontSize: isMobile ? '14px' : '16px',
            },
        },
        dialogButton: {
            minHeight: '44px',
            fontSize: isMobile ? '14px' : '16px',
            width: isMobile ? '100%' : 'auto',
        },
    };

    const organizationTypes = [
        { value: 'SCHOOL', label: 'School' },
        { value: 'INSTITUTE', label: 'Institute' },
        { value: 'COMPANY', label: 'Company' },
    ];

    const handleOpenDialog = (type, org = null) => {
        setDialogType(type);
        setSelectedOrg(org);
        if (type === 'edit' && org) {
            setFormData({
                name: org.name,
                type: org.type,
                status: org.status,
            });
        } else {
            setFormData({
                name: '',
                type: 'COMPANY',
                status: 'ACTIVE',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrg(null);
        setFormData({
            name: '',
            type: 'COMPANY',
            status: 'ACTIVE',
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (dialogType === 'create') {
                const newOrg = {
                    id: organizations.length + 1,
                    ...formData,
                    admins: 0,
                    members: 0,
                };
                setOrganizations([...organizations, newOrg]);
            } else if (dialogType === 'edit' && selectedOrg) {
                setOrganizations(organizations.map(org =>
                    org.id === selectedOrg.id ? { ...org, ...formData } : org
                ));
            }

            setLoading(false);
            handleCloseDialog();
        }, 1000);
    };

    const handleDelete = (orgId) => {
        if (window.confirm('Are you sure you want to delete this organization? This will affect all associated admins.')) {
            setOrganizations(organizations.filter(org => org.id !== orgId));
        }
    };

    const handleStatusToggle = (orgId) => {
        setOrganizations(organizations.map(org => {
            if (org.id === orgId) {
                const newStatus = org.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                return { ...org, status: newStatus };
            }
            return org;
        }));
    };

    const toggleExpand = (orgId) => {
        setExpandedOrg(expandedOrg === orgId ? null : orgId);
    };

    const getOrgTypeLabel = (type) => {
        const labels = {
            'SCHOOL': 'School',
            'INSTITUTE': 'Institute',
            'COMPANY': 'Company',
        };
        return labels[type] || type;
    };

    const getStatusColor = (status) => {
        return status === 'ACTIVE' ? 'success' : 'error';
    };

    if (user?.role !== 'SUPER_ADMIN') {
        return (
            <Box sx={styles.container}>
                <Alert severity="error">
                    Access Denied. Only Super Admin can manage organizations.
                </Alert>
            </Box>
        );
    }

    // Calculate stats
    const stats = {
        total: organizations.length,
        active: organizations.filter(o => o.status === 'ACTIVE').length,
        inactive: organizations.filter(o => o.status === 'INACTIVE').length,
        totalAdmins: organizations.reduce((sum, org) => sum + org.admins, 0),
        totalMembers: organizations.reduce((sum, org) => sum + org.members, 0),
    };

    return (
        <Box sx={styles.container}>
            {/* Header */}
            <Paper sx={styles.header}>
                <Box sx={styles.headerContent}>
                    <Box sx={styles.headerLeft}>
                        <Business sx={styles.headerIcon} />
                        <Box>
                            <Typography sx={styles.headerText}>
                                Manage Organizations
                            </Typography>
                            <Typography sx={styles.headerSubtext}>
                                Create and manage organizations
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog('create')}
                        sx={styles.addButton}
                    >
                        New Organization
                    </Button>
                </Box>
            </Paper>

            {/* Organizations List - Mobile Card View */}
            <Box sx={{ marginTop: '24px' }}>
                {organizations.map((org) => (
                    <Card key={org.id} sx={styles.orgCard}>
                        {/* Card Header */}
                        <Box
                            sx={styles.orgCardHeader}
                            onClick={() => toggleExpand(org.id)}
                        >
                            <Box sx={styles.orgInfo}>
                                <Typography sx={styles.orgName}>
                                    {org.name}
                                </Typography>
                                <Chip
                                    label={getOrgTypeLabel(org.type)}
                                    size="small"
                                    variant="outlined"
                                    sx={styles.orgTypeChip}
                                />
                                <Chip
                                    label={org.status}
                                    size="small"
                                    color={getStatusColor(org.status)}
                                    variant="outlined"
                                    sx={styles.orgStatusChip}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {expandedOrg === org.id ? <ExpandLess /> : <ExpandMore />}
                            </Box>
                        </Box>

                        {/* Expanded Content */}
                        {expandedOrg === org.id && (
                            <Box sx={styles.orgCardContent}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Organization Details
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Person sx={{ fontSize: '16px', color: 'primary.main' }} />
                                                <Typography variant="body2">
                                                    {org.admins} Admin{org.admins !== 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2">
                                                {org.members} Member{org.members !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Actions
                                        </Typography>
                                        <Box sx={styles.actionButtons}>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog('edit', org)}
                                                title="Edit"
                                            >
                                                <Edit sx={styles.actionIcon} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color={org.status === 'ACTIVE' ? 'error' : 'success'}
                                                onClick={() => handleStatusToggle(org.id)}
                                                title={org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                            >
                                                {org.status === 'ACTIVE' ?
                                                    <Cancel sx={styles.actionIcon} /> :
                                                    <CheckCircle sx={styles.actionIcon} />
                                                }
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(org.id)}
                                                title="Delete"
                                            >
                                                <Delete sx={styles.actionIcon} />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Card>
                ))}
            </Box>

            {/* Stats Summary */}
            <Paper sx={styles.statsGrid}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3} sx={styles.statItem}>
                        <Typography sx={styles.statValue}>
                            {stats.total}
                        </Typography>
                        <Typography sx={styles.statLabel}>
                            Total
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3} sx={styles.statItem}>
                        <Typography sx={{ ...styles.statValue, color: 'success.main' }}>
                            {stats.active}
                        </Typography>
                        <Typography sx={styles.statLabel}>
                            Active
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3} sx={styles.statItem}>
                        <Typography sx={{ ...styles.statValue, color: 'error.main' }}>
                            {stats.inactive}
                        </Typography>
                        <Typography sx={styles.statLabel}>
                            Inactive
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3} sx={styles.statItem}>
                        <Typography sx={styles.statValue}>
                            {stats.totalAdmins}
                        </Typography>
                        <Typography sx={styles.statLabel}>
                            Admins
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{ sx: styles.dialogPaper }}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Business sx={{ color: 'primary.main' }} />
                        {dialogType === 'create' ? 'Create New Organization' : 'Edit Organization'}
                    </Box>
                </DialogTitle>

                <DialogContent sx={styles.dialogContent}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <TextField
                            fullWidth
                            required
                            label="Organization Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={styles.formField}
                        />

                        <TextField
                            fullWidth
                            required
                            select
                            label="Organization Type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={styles.formField}
                        >
                            {organizationTypes.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            required
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={styles.formField}
                        >
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </TextField>

                        {dialogType === 'edit' && formData.status === 'INACTIVE' && (
                            <Alert severity="warning">
                                Setting organization to INACTIVE will deactivate all associated admin accounts.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={styles.dialogActions}>
                    <Button
                        onClick={handleCloseDialog}
                        disabled={loading}
                        sx={styles.dialogButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !formData.name.trim()}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                        sx={styles.dialogButton}
                    >
                        {loading ? 'Saving...' : dialogType === 'create' ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageOrganizations;