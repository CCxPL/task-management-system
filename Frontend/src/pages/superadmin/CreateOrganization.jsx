import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
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
    Stepper,
    Step,
    StepLabel,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Business as BusinessIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    ArrowBack as ArrowBackIcon,
    Visibility,
    VisibilityOff,
    School as SchoolIcon,
    Apartment as ApartmentIcon,
    CorporateFare as CorporateFareIcon,
} from '@mui/icons-material';

const CreateOrganization = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const steps = ['Organization Details', 'Admin Account', 'Review & Create'];

    const [formData, setFormData] = useState({
        name: '',
        type: 'COMPANY',
        description: '',
        admin_username: '',
        admin_email: '',
        admin_password: '',
        confirm_password: '',
    });

    const organizationTypes = [
        { value: 'COMPANY', label: 'Company', icon: <CorporateFareIcon /> },
        { value: 'INSTITUTE', label: 'Institute', icon: <ApartmentIcon /> },
        { value: 'SCHOOL', label: 'School', icon: <SchoolIcon /> },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateStep = () => {
        switch (activeStep) {
            case 0:
                if (!formData.name.trim()) {
                    setError('Organization name is required');
                    return false;
                }
                if (!formData.type) {
                    setError('Organization type is required');
                    return false;
                }
                break;

            case 1:
                if (!formData.admin_username.trim()) {
                    setError('Admin username is required');
                    return false;
                }
                if (!formData.admin_email.trim()) {
                    setError('Admin email is required');
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
                    setError('Invalid email format');
                    return false;
                }
                if (formData.admin_password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return false;
                }
                if (formData.admin_password !== formData.confirm_password) {
                    setError('Passwords do not match');
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('access_token');
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

            console.log('📤 Creating organization:', formData);

            const response = await fetch(`${baseURL}/api/organizations/super-admin/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.type,
                    description: formData.description,
                    admin_username: formData.admin_username,
                    admin_email: formData.admin_email,
                    admin_password: formData.admin_password,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization');
            }

            console.log('✅ Organization created:', data);
            setSuccess('Organization created successfully!');

            setTimeout(() => {
                navigate('/super-admin/dashboard');
            }, 2000);

        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                            Organization Information
                        </Typography>

                        <TextField
                            fullWidth
                            label="Organization Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Acme Corporation"
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <BusinessIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            select
                            fullWidth
                            label="Organization Type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                        >
                            {organizationTypes.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {type.icon}
                                        {type.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Description (Optional)"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            placeholder="Brief description..."
                        />
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                            Organization Admin Account
                        </Typography>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            This account will have full administrative access
                        </Alert>

                        <TextField
                            fullWidth
                            label="Admin Username"
                            name="admin_username"
                            value={formData.admin_username}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            type="email"
                            label="Admin Email"
                            name="admin_email"
                            value={formData.admin_email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            name="admin_password"
                            value={formData.admin_password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label="Confirm Password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                            Review & Confirm
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Organization Details
                                    </Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="textSecondary">Name</Typography>
                                        <Typography variant="body1" fontWeight="500">{formData.name}</Typography>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="textSecondary">Type</Typography>
                                        <Typography variant="body1" fontWeight="500">{formData.type}</Typography>
                                    </Box>
                                    {formData.description && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" color="textSecondary">Description</Typography>
                                            <Typography variant="body1">{formData.description}</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Admin Account
                                    </Typography>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="textSecondary">Username</Typography>
                                        <Typography variant="body1" fontWeight="500">{formData.admin_username}</Typography>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="textSecondary">Email</Typography>
                                        <Typography variant="body1" fontWeight="500">{formData.admin_email}</Typography>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="textSecondary">Password</Typography>
                                        <Typography variant="body1" fontWeight="500">••••••••</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Alert severity="warning" sx={{ mt: 3 }}>
                            Please review all details carefully
                        </Alert>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', minHeight: '100vh' }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/super-admin/dashboard')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{
                        background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Create Organization
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Set up a new organization with admin account
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto', borderRadius: 2 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

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

                <Box sx={{ minHeight: 400 }}>
                    {getStepContent(activeStep)}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #E0E0E0' }}>
                    <Button onClick={handleBack} disabled={activeStep === 0 || loading}>
                        Back
                    </Button>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/super-admin/dashboard')} disabled={loading}>
                            Cancel
                        </Button>

                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                }}
                            >
                                {loading ? 'Creating...' : 'Create Organization'}
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default CreateOrganization;