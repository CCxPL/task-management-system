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
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { PersonAdd, Business, CheckCircle } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const CreateAdmin = () => {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
        organizationType: 'COMPANY',
        adminRole: 'ORG_ADMIN',
    });

    // RESPONSIVE HOOKS
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDarkMode = theme.palette.mode === 'dark';

    // Mock organizations data
    const mockOrganizations = [
        { id: 1, name: 'Acme Corporation', type: 'COMPANY', status: 'ACTIVE' },
        { id: 2, name: 'Tech University', type: 'INSTITUTE', status: 'ACTIVE' },
        { id: 3, name: 'Startup XYZ', type: 'COMPANY', status: 'INACTIVE' },
    ];

    const organizationTypes = [
        { value: 'SCHOOL', label: 'School' },
        { value: 'INSTITUTE', label: 'Institute' },
        { value: 'COMPANY', label: 'Company' },
    ];

    const adminRoles = [
        { value: 'ORG_ADMIN', label: 'Organization Admin' },
    ];

    // RESPONSIVE STYLES
    const styles = {
        container: {
            padding: isMobile ? '16px' : '24px',
            maxWidth: '100%',
            overflowX: 'hidden',
        },
        paper: {
            border: `1.5px solid ${isDarkMode ? '#3D444D' : '#C1C7D0'}`,
            borderRadius: '6px',
            padding: isMobile ? '20px' : '32px',
            margin: '0 auto',
            maxWidth: isMobile ? '100%' : '800px',
            backgroundColor: isDarkMode ? '#1D2125' : '#FFFFFF',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0',
        },
        headerIcon: {
            fontSize: isMobile ? '28px' : '32px',
            marginRight: isMobile ? '0' : '16px',
            marginBottom: isMobile ? '8px' : '0',
            color: theme.palette.primary.main,
        },
        headerText: {
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
            textAlign: isMobile ? 'center' : 'left',
            color: isDarkMode ? '#FFFFFF' : 'inherit',
        },
        formGrid: {
            margin: isMobile ? '-8px' : '-12px',
            width: 'calc(100% + 16px)',
        },
        gridItem: {
            padding: isMobile ? '8px' : '12px',
        },
        textField: {
            width: '100%',
            marginBottom: isMobile ? '12px' : '16px',
            '& .MuiInputBase-root': {
                fontSize: isMobile ? '14px' : '16px',
            },
        },
        sectionTitle: {
            fontSize: isMobile ? '1rem' : '1.125rem',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        buttonGroup: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            flexDirection: isMobile ? 'column' : 'row',
        },
        button: {
            minHeight: '44px', // Touch target
            fontSize: isMobile ? '14px' : '16px',
            width: isMobile ? '100%' : 'auto',
        },
        infoCard: {
            borderColor: isDarkMode ? '#3D444D' : '#C1C7D0',
            backgroundColor: isDarkMode ? '#161A1D' : '#F4F5F7',
            marginTop: '16px',
            padding: isMobile ? '12px' : '16px',
        },
        chip: {
            height: '20px',
            fontSize: '0.75rem',
            margin: '0 4px',
        },
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Creating admin with:', formData);

            // Logic: Admin status depends on organization status
            const selectedOrg = mockOrganizations.find(
                org => org.name === formData.organizationName
            );

            if (selectedOrg) {
                console.log('Admin status will be:', selectedOrg.status);
            }

            setLoading(false);
            setSuccess(true);

            // Reset form after 2 seconds
            setTimeout(() => {
                setSuccess(false);
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    organizationName: '',
                    organizationType: 'COMPANY',
                    adminRole: 'ORG_ADMIN',
                });
            }, 2000);
        }, 1500);
    };

    if (user?.role !== 'SUPER_ADMIN') {
        return (
            <Box sx={styles.container}>
                <Alert severity="error">
                    Access Denied. Only Super Admin can create administrators.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Paper sx={styles.paper}>
                {/* Header */}
                <Box sx={styles.header}>
                    <PersonAdd sx={styles.headerIcon} />
                    <Typography variant="h5" sx={styles.headerText}>
                        Create Organization Admin
                    </Typography>
                </Box>

                <Divider sx={{ marginBottom: '24px' }} />

                {/* Success Alert */}
                {success && (
                    <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{ marginBottom: '24px' }}
                        onClose={() => setSuccess(false)}
                    >
                        Admin created successfully! Admin status is linked to organization status.
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={styles.formGrid}>
                        {/* Organization Details Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={styles.sectionTitle}>
                                <Business fontSize={isMobile ? "small" : "medium"} />
                                Organization Details
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                label="Organization Name"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Organization Type"
                                name="organizationType"
                                value={formData.organizationType}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                            >
                                {organizationTypes.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Admin Details Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ ...styles.sectionTitle, marginTop: '16px' }}>
                                Admin Account Details
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                type="email"
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="Confirm Password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                                helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? "Passwords don't match" : ""}
                            />
                        </Grid>

                        <Grid item xs={12} sx={styles.gridItem}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Admin Role"
                                name="adminRole"
                                value={formData.adminRole}
                                onChange={handleChange}
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                sx={styles.textField}
                            >
                                {adminRoles.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Information Card */}
                        <Grid item xs={12} sx={styles.gridItem}>
                            <Card variant="outlined" sx={styles.infoCard}>
                                <CardContent sx={{ padding: isMobile ? '8px' : '12px' }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                        Important Note:
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        • Admin account status will be automatically synchronized with organization status
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            • If organization is
                                        </Typography>
                                        <Chip
                                            label="ACTIVE"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            sx={styles.chip}
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            → Admin will be ACTIVE
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, marginTop: '4px' }}>
                                        <Typography variant="body2" color="textSecondary">
                                            • If organization is
                                        </Typography>
                                        <Chip
                                            label="INACTIVE"
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            sx={styles.chip}
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            → Admin will be INACTIVE
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Submit Buttons */}
                        <Grid item xs={12} sx={styles.gridItem}>
                            <Box sx={styles.buttonGroup}>
                                <Button
                                    variant="outlined"
                                    onClick={() => window.history.back()}
                                    disabled={loading}
                                    sx={styles.button}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || formData.password !== formData.confirmPassword}
                                    startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                                    sx={styles.button}
                                >
                                    {loading ? 'Creating Admin...' : 'Create Admin'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default CreateAdmin;