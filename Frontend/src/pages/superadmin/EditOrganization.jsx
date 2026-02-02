import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Alert,
    Grid,
    Divider,
    useTheme,
    CircularProgress,
    IconButton,
    Chip,
} from '@mui/material';
import {
    ArrowBack,
    Save,
    Business,
    Email,
    Phone,
    Language,
    LocationOn,
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config/api';

const EditOrganization = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        type: 'COMPANY',
        email: '',
        phone: '',
        domain: '',
        address: '',
        status: 'ACTIVE',
    });

    const organizationTypes = [
        { value: 'COMPANY', label: 'Company' },
        { value: 'INSTITUTE', label: 'Institute' },
        { value: 'SCHOOL', label: 'School' },
    ];

    const statusOptions = [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
    ];

    useEffect(() => {
        fetchOrganization();
    }, [id]);

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            console.log('🔍 Fetching organization ID:', id);

            const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/organizations/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch organization');

            const data = await response.json();
            console.log('📥 All organizations:', data);

            const org = data.find(o => o.id === parseInt(id));

            if (!org) throw new Error('Organization not found');

            console.log('✅ Found organization:', org);

            // ✅ Pre-fill form with existing data
            setFormData({
                name: org.name || '',
                type: org.type || 'COMPANY',
                email: org.email || '',
                phone: org.phone || '',
                domain: org.domain || '',
                address: org.address || '',
                status: org.status || 'ACTIVE',
            });

        } catch (err) {
            console.error('❌ Error fetching organization:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');

            const token = localStorage.getItem('access_token');

            console.log('📤 Updating organization:', formData);

            const response = await fetch(`${API_BASE_URL}/api/organizations/super-admin/organizations/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            console.log('📥 Update response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update organization');
            }

            setSuccess('Organization updated successfully!');

            setTimeout(() => {
                navigate('/super-admin/organizations');
            }, 1500);

        } catch (err) {
            console.error('❌ Error updating organization:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !formData.name) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate('/super-admin/organizations')} sx={{ mt: 2 }}>
                    Back to Organizations
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/super-admin/organizations')}>
                    <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Edit Organization
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Update organization details
                    </Typography>
                </Box>
                <Chip
                    label={formData.status}
                    color={formData.status === 'ACTIVE' ? 'success' : 'error'}
                />
            </Box>

            {/* Form */}
            <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto', borderRadius: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Business color="primary" />
                                Basic Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                label="Organization Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Acme Corporation"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Organization Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                {organizationTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                {statusOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Contact Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                Contact Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="email"
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="info@company.com"
                                InputProps={{
                                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1234567890"
                                InputProps={{
                                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Domain"
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                placeholder="company.com"
                                InputProps={{
                                    startAdornment: <Language sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Main St, City"
                                InputProps={{
                                    startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>

                        {/* Warning if changing to INACTIVE */}
                        {formData.status === 'INACTIVE' && (
                            <Grid item xs={12}>
                                <Alert severity="warning">
                                    <strong>Warning:</strong> Setting organization to INACTIVE will deactivate all associated admin and member accounts.
                                </Alert>
                            </Grid>
                        )}

                        {/* Actions */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/super-admin/organizations')}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                    sx={{
                                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default EditOrganization;