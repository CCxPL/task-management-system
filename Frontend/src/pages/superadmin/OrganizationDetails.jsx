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
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Business,
    Email,
    Phone,
    Language,
    LocationOn,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config/api';

const OrganizationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrganization();
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

    if (loading) {
        return <Box sx={{ p: 3 }}>Loading...</Box>;
    }

    if (error || !org) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Organization not found'}</Alert>
                <Button onClick={() => navigate('/super-admin/organizations')} sx={{ mt: 2 }}>
                    Back to Organizations
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/super-admin/organizations')}>
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
                <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => navigate(`/super-admin/organizations/${id}/edit`)}
                >
                    Edit
                </Button>
            </Box>

            {/* Details */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Basic Information
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
                                    Status
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={org.status}
                                        color={org.status === 'ACTIVE' ? 'success' : 'error'}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Contact Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {org.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Email fontSize="small" color="action" />
                                    <Typography variant="body2">{org.email}</Typography>
                                </Box>
                            )}

                            {org.phone && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Phone fontSize="small" color="action" />
                                    <Typography variant="body2">{org.phone}</Typography>
                                </Box>
                            )}

                            {org.domain && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Language fontSize="small" color="action" />
                                    <Typography variant="body2">{org.domain}</Typography>
                                </Box>
                            )}

                            {org.address && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOn fontSize="small" color="action" />
                                    <Typography variant="body2">{org.address}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="600">
                            Statistics
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {org.admins || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Admins
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="secondary">
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
            </Grid>
        </Box>
    );
};

export default OrganizationDetails;