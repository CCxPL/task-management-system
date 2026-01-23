import React from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Paper,
    Chip,
    Avatar,
    AvatarGroup,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Business,
    Group,
    Person,
    CheckCircle,
    Cancel,
    TrendingUp,
    School,
    CorporateFare,
    Apartment,
    Add,
    Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

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
            marginBottom: isMobile ? '24px' : '32px',
        },
        title: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 'bold',
            marginBottom: '8px',
        },
        subtitle: {
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: 'text.secondary',
        },
        quickActions: {
            display: 'flex',
            gap: isMobile ? '12px' : '16px',
            flexWrap: 'wrap',
            marginBottom: '32px',
        },
        actionButton: {
            minHeight: '44px',
            fontSize: isMobile ? '14px' : '16px',
            flex: isMobile ? '1 1 calc(50% - 6px)' : 'none',
            minWidth: isMobile ? '0' : '200px',
        },
        card: {
            border: '1.5px solid #C1C7D0',
            borderRadius: '8px',
            height: '100%',
            transition: 'all 0.2s ease',
            '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: '#A5ADBA',
            }
        },
        cardContent: {
            padding: isMobile ? '16px' : '20px',
            height: '100%',
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: isMobile ? '12px' : '16px',
        },
        cardIcon: {
            fontSize: isMobile ? '28px' : '32px',
            marginRight: isMobile ? '12px' : '16px',
        },
        cardNumber: {
            fontSize: isMobile ? '1.75rem' : '2rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        cardLabel: {
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: 'text.secondary',
        },
        sectionPaper: {
            border: '1.5px solid #C1C7D0',
            borderRadius: '8px',
            padding: isMobile ? '16px' : '24px',
            height: '100%',
        },
        sectionTitle: {
            fontSize: isMobile ? '1rem' : '1.125rem',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sectionButton: {
            fontSize: isMobile ? '12px' : '14px',
            minHeight: '36px',
        },
        orgItem: {
            padding: isMobile ? '12px' : '16px',
            border: '1px solid #C1C7D0',
            borderRadius: '6px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0',
            backgroundColor: '#F4F5F7',
        },
        orgInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px',
            flexWrap: 'wrap',
        },
        orgIcon: {
            fontSize: isMobile ? '20px' : '24px',
        },
        orgName: {
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontWeight: '500',
        },
        orgMeta: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            color: 'text.secondary',
        },
        orgActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        avatarGroup: {
            '& .MuiAvatar-root': {
                width: isMobile ? '24px' : '28px',
                height: isMobile ? '24px' : '28px',
                fontSize: isMobile ? '12px' : '14px',
            }
        },
        adminItem: {
            padding: isMobile ? '8px 0' : '12px 0',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            '&:last-child': {
                borderBottom: 'none',
            }
        },
        adminInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '12px',
        },
        adminAvatar: {
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            fontSize: isMobile ? '14px' : '16px',
        },
        adminName: {
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontWeight: '500',
        },
        adminEmail: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            color: 'text.secondary',
        },
        legendPaper: {
            border: '1.5px solid #C1C7D0',
            borderRadius: '8px',
            padding: isMobile ? '16px' : '24px',
            backgroundColor: '#F4F5F7',
            marginTop: '32px',
        },
        legendItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: isMobile ? '8px' : '12px',
        },
        legendText: {
            fontSize: isMobile ? '0.875rem' : '1rem',
        },
    };

    // Mock data
    const organizations = [
        { id: 1, name: 'Acme Corporation', type: 'COMPANY', status: 'ACTIVE', admins: 2, members: 45 },
        { id: 2, name: 'Tech University', type: 'INSTITUTE', status: 'ACTIVE', admins: 1, members: 120 },
        { id: 3, name: 'Green Valley School', type: 'SCHOOL', status: 'ACTIVE', admins: 1, members: 80 },
        { id: 4, name: 'Startup XYZ', type: 'COMPANY', status: 'INACTIVE', admins: 1, members: 12 },
    ];

    const recentAdmins = [
        { id: 1, name: 'John Doe', email: 'john@acme.com', organization: 'Acme Corporation', role: 'ORG_ADMIN', status: 'ACTIVE' },
        { id: 2, name: 'Jane Smith', email: 'jane@university.edu', organization: 'Tech University', role: 'ORG_ADMIN', status: 'ACTIVE' },
        { id: 3, name: 'Bob Wilson', email: 'bob@school.edu', organization: 'Green Valley School', role: 'ORG_ADMIN', status: 'ACTIVE' },
    ];

    const stats = {
        totalOrganizations: organizations.length,
        activeOrganizations: organizations.filter(o => o.status === 'ACTIVE').length,
        totalAdmins: organizations.reduce((sum, org) => sum + org.admins, 0),
        totalMembers: organizations.reduce((sum, org) => sum + org.members, 0),
        byType: {
            SCHOOL: organizations.filter(o => o.type === 'SCHOOL').length,
            INSTITUTE: organizations.filter(o => o.type === 'INSTITUTE').length,
            COMPANY: organizations.filter(o => o.type === 'COMPANY').length,
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'SCHOOL': return <School sx={styles.orgIcon} />;
            case 'INSTITUTE': return <Apartment sx={styles.orgIcon} />;
            case 'COMPANY': return <CorporateFare sx={styles.orgIcon} />;
            default: return <Business sx={styles.orgIcon} />;
        }
    };

    const getTypeLabel = (type) => {
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
                <Typography color="error">
                    Access Denied. Only Super Admin can view this dashboard.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            {/* Header */}
            <Box sx={styles.header}>
                <Typography variant="h4" sx={styles.title}>
                    Super Admin Dashboard
                </Typography>
                <Typography sx={styles.subtitle}>
                    Manage all organizations and administrators across the platform
                </Typography>
            </Box>

            {/* Quick Actions */}
            <Box sx={styles.quickActions}>
                <Button
                    variant="contained"
                    startIcon={<Person />}
                    onClick={() => navigate('/super-admin/create-admin')}
                    sx={styles.actionButton}
                >
                    Create Admin
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Business />}
                    onClick={() => navigate('/super-admin/organizations')}
                    sx={styles.actionButton}
                >
                    Manage Organizations
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Group />}
                    onClick={() => navigate('/super-admin/manage-admins')}
                    sx={styles.actionButton}
                >
                    View All Admins
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={isMobile ? 2 : 3} sx={{ marginBottom: '32px' }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={styles.card}>
                        <CardContent sx={styles.cardContent}>
                            <Box sx={styles.cardHeader}>
                                <Business sx={{ ...styles.cardIcon, color: 'primary.main' }} />
                                <Box>
                                    <Typography sx={styles.cardNumber}>
                                        {stats.totalOrganizations}
                                    </Typography>
                                    <Typography sx={styles.cardLabel}>
                                        Total Organizations
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                <Chip
                                    label={`${stats.byType.SCHOOL} Schools`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: '20px', fontSize: '0.75rem' }}
                                />
                                <Chip
                                    label={`${stats.byType.INSTITUTE} Institutes`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: '20px', fontSize: '0.75rem' }}
                                />
                                <Chip
                                    label={`${stats.byType.COMPANY} Companies`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: '20px', fontSize: '0.75rem' }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={styles.card}>
                        <CardContent sx={styles.cardContent}>
                            <Box sx={styles.cardHeader}>
                                <CheckCircle sx={{ ...styles.cardIcon, color: 'success.main' }} />
                                <Box>
                                    <Typography sx={{ ...styles.cardNumber, color: 'success.main' }}>
                                        {stats.activeOrganizations}
                                    </Typography>
                                    <Typography sx={styles.cardLabel}>
                                        Active Organizations
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {((stats.activeOrganizations / stats.totalOrganizations) * 100).toFixed(0)}% active rate
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={styles.card}>
                        <CardContent sx={styles.cardContent}>
                            <Box sx={styles.cardHeader}>
                                <Person sx={{ ...styles.cardIcon, color: 'info.main' }} />
                                <Box>
                                    <Typography sx={styles.cardNumber}>
                                        {stats.totalAdmins}
                                    </Typography>
                                    <Typography sx={styles.cardLabel}>
                                        Total Admins
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {organizations.filter(o => o.status === 'ACTIVE').length} active orgs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={styles.card}>
                        <CardContent sx={styles.cardContent}>
                            <Box sx={styles.cardHeader}>
                                <Group sx={{ ...styles.cardIcon, color: 'warning.main' }} />
                                <Box>
                                    <Typography sx={styles.cardNumber}>
                                        {stats.totalMembers}
                                    </Typography>
                                    <Typography sx={styles.cardLabel}>
                                        Total Members
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                Across all organizations
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Admins & Organizations */}
            <Grid container spacing={isMobile ? 2 : 3}>
                {/* Recent Admins */}
                <Grid item xs={12} md={6}>
                    <Paper sx={styles.sectionPaper}>
                        <Box sx={styles.sectionTitle}>
                            <Typography>Recent Admins</Typography>
                            <Button
                                size="small"
                                onClick={() => navigate('/super-admin/manage-admins')}
                                sx={styles.sectionButton}
                            >
                                View All
                            </Button>
                        </Box>

                        {recentAdmins.map((admin) => (
                            <Box key={admin.id} sx={styles.adminItem}>
                                <Box sx={styles.adminInfo}>
                                    <Avatar
                                        sx={styles.adminAvatar}
                                        src={`https://i.pravatar.cc/150?u=${admin.id}`}
                                    >
                                        {admin.name.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={styles.adminName}>
                                            {admin.name}
                                        </Typography>
                                        <Typography sx={styles.adminEmail}>
                                            {admin.email}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {admin.organization}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={admin.status}
                                    size="small"
                                    color={getStatusColor(admin.status)}
                                    variant="outlined"
                                    sx={{ marginTop: isMobile ? '8px' : '0' }}
                                />
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Organizations Overview */}
                <Grid item xs={12} md={6}>
                    <Paper sx={styles.sectionPaper}>
                        <Box sx={styles.sectionTitle}>
                            <Typography>Organizations</Typography>
                            <Button
                                size="small"
                                onClick={() => navigate('/super-admin/organizations')}
                                sx={styles.sectionButton}
                            >
                                Manage All
                            </Button>
                        </Box>

                        {organizations.map((org) => (
                            <Box key={org.id} sx={styles.orgItem}>
                                <Box sx={styles.orgInfo}>
                                    {getTypeIcon(org.type)}
                                    <Box>
                                        <Typography sx={styles.orgName}>
                                            {org.name}
                                        </Typography>
                                        <Typography sx={styles.orgMeta}>
                                            {getTypeLabel(org.type)} • {org.admins} Admin{org.admins !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={styles.orgActions}>
                                    <AvatarGroup max={3} sx={styles.avatarGroup}>
                                        {[...Array(Math.min(org.admins, 3))].map((_, i) => (
                                            <Avatar key={i} sx={{ bgcolor: 'primary.main' }}>
                                                {org.name.charAt(0)}
                                            </Avatar>
                                        ))}
                                    </AvatarGroup>
                                    <Chip
                                        label={org.status}
                                        size="small"
                                        color={getStatusColor(org.status)}
                                        variant="outlined"
                                        sx={{ height: '24px' }}
                                    />
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Status Legend */}
            <Paper sx={styles.legendPaper}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Status Legend
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Box sx={styles.legendItem}>
                            <CheckCircle color="success" fontSize={isMobile ? "small" : "medium"} />
                            <Typography sx={styles.legendText}>
                                <strong>ACTIVE Organization:</strong> Admins can access system
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={styles.legendItem}>
                            <Cancel color="error" fontSize={isMobile ? "small" : "medium"} />
                            <Typography sx={styles.legendText}>
                                <strong>INACTIVE Organization:</strong> All admins deactivated
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={styles.legendItem}>
                            <TrendingUp color="primary" fontSize={isMobile ? "small" : "medium"} />
                            <Typography sx={styles.legendText}>
                                <strong>Admin Status:</strong> Syncs with organization
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default SuperAdminDashboard;