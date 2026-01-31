import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    useTheme,
    useMediaQuery,
    Alert,
    IconButton,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import {
    Business,
    Group,
    Person,
    CheckCircle,
    Cancel,
    Add,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    School,
    CorporateFare,
    Apartment,
} from '@mui/icons-material';

const SuperAdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDarkMode = theme.palette.mode === 'dark';

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total_organizations: 0,
        active_organizations: 0,
        inactive_organizations: 0,
        total_admins: 0,
        total_members: 0,
        by_type: {
            COMPANY: 0,
            INSTITUTE: 0,
            SCHOOL: 0,
        }
    });
    const [organizations, setOrganizations] = useState([]);
    const [error, setError] = useState('');

    // Fetch data
    const fetchData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError('');

            const token = localStorage.getItem('access_token');
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

            // Fetch stats
            const statsRes = await fetch(`${baseURL}/api/organizations/super-admin/stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!statsRes.ok) {
                const errorData = await statsRes.json();
                throw new Error(errorData.error || 'Failed to fetch stats');
            }
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch organizations
            const orgsRes = await fetch(`${baseURL}/api/organizations/super-admin/organizations/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!orgsRes.ok) {
                const errorData = await orgsRes.json();
                throw new Error(errorData.error || 'Failed to fetch organizations');
            }
            const orgsData = await orgsRes.json();
            setOrganizations(orgsData);

            console.log('✅ Super Admin data loaded');

        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            fetchData();
        }
    }, [user]);

    const handleRefresh = () => {
        fetchData(true);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'SCHOOL': return <School sx={{ fontSize: 24 }} color="primary" />;
            case 'INSTITUTE': return <Apartment sx={{ fontSize: 24 }} color="secondary" />;
            case 'COMPANY': return <CorporateFare sx={{ fontSize: 24 }} color="info" />;
            default: return <Business sx={{ fontSize: 24 }} />;
        }
    };

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user || user.role !== 'SUPER_ADMIN') {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Access Denied. Only Super Admin can view this dashboard.</Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{
                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        ⚙️ Super Admin Dashboard
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Manage all organizations and administrators
                    </Typography>
                </Box>
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                    <RefreshIcon sx={{
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                        }
                    }} />
                </IconButton>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/super-admin/create-organization')}
                    sx={{
                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        '&:hover': { background: 'linear-gradient(45deg, #2563EB 30%, #7C3AED 90%)' }
                    }}
                >
                    Create Organization
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<Business />}
                    onClick={() => navigate('/super-admin/organizations')}
                >
                    Manage All Organizations
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        border: `1.5px solid ${isDarkMode ? '#3D444D' : '#C1C7D0'}`,
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Business sx={{ fontSize: 40, color: '#3B82F6', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total_organizations}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Total Organizations
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                <Chip label={`${stats.by_type.COMPANY || 0} Companies`} size="small" variant="outlined" />
                                <Chip label={`${stats.by_type.SCHOOL || 0} Schools`} size="small" variant="outlined" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        border: `1.5px solid ${isDarkMode ? '#3D444D' : '#C1C7D0'}`,
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircle sx={{ fontSize: 40, color: '#10B981', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#10B981' }}>
                                        {stats.active_organizations}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Active Organizations
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label={`${stats.total_organizations > 0
                                    ? ((stats.active_organizations / stats.total_organizations) * 100).toFixed(0)
                                    : 0}% active rate`}
                                size="small"
                                color="success"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        border: `1.5px solid ${isDarkMode ? '#3D444D' : '#C1C7D0'}`,
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Person sx={{ fontSize: 40, color: '#F59E0B', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total_admins}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Total Admins
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                                Across {stats.active_organizations} active orgs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        border: `1.5px solid ${isDarkMode ? '#3D444D' : '#C1C7D0'}`,
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Group sx={{ fontSize: 40, color: '#8B5CF6', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {stats.total_members}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Total Members
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                                Across all organizations
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Organizations Table */}
            <Paper sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${isDarkMode ? '#3D444D' : '#E0E0E0'}`,
                bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="600">
                        Organizations ({filteredOrganizations.length})
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {filteredOrganizations.length === 0 ? (
                    <Alert severity="info">
                        {searchQuery ? 'No organizations match your search' : 'No organizations found'}
                    </Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
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
                                {filteredOrganizations.map((org) => (
                                    <TableRow
                                        key={org.id}
                                        sx={{
                                            '&:hover': { bgcolor: isDarkMode ? '#2C3137' : '#F4F5F7' },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getTypeIcon(org.type)}
                                                <Typography variant="body2" fontWeight="500">
                                                    {org.name}
                                                </Typography>
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
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{org.admins || 0}</TableCell>
                                        <TableCell>{org.members || 0}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/super-admin/organizations/${org.id}`)}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/super-admin/organizations/${org.id}/edit`)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default SuperAdminDashboard;
