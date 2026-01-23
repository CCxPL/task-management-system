import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Link,
    Container,
    Fade,
    InputAdornment,
    IconButton,
    Card,
} from '@mui/material';
import {
    Login as LoginIcon,
    Visibility,
    VisibilityOff,
    PersonOutline,
    LockOutlined,
    RocketLaunch
} from '@mui/icons-material';
import { login, clearError } from '../../app/slices/authSlice';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error, user } = useSelector((state) => state.auth);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Scope Document: Minimal validation
        if (!formData.username.trim() || !formData.password.trim()) {
            dispatch(clearError()); // API will handle validation
        }

        // API Contract: Exact request format
        const credentials = {
            username: formData.username,
            password: formData.password,
        };

        const result = await dispatch(login(credentials));

        // API Contract: On success, tokens received and stored
        if (!result.error) {
            // Frontend Scope Document: Navigate to Dashboard
            navigate('/dashboard');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #0052CC22, #0747A611)',
                    top: '-100px',
                    right: '-100px',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #0747A611, #0052CC22)',
                    bottom: '-100px',
                    left: '-100px',
                },
            }}
        >
            <Fade in={true} timeout={800}>
                <Container maxWidth="sm">
                    <Card
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4, md: 5 },
                            borderRadius: 3,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(0, 82, 204, 0.1)',
                            boxShadow: '0 20px 60px rgba(0, 82, 204, 0.15)',
                            position: 'relative',
                            zIndex: 1,
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #0052CC, #0747A6)',
                            },
                        }}
                    >
                        {/* Logo/Header */}
                        <Box textAlign="center" mb={4}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 60,
                                    height: 60,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #0052CC, #0747A6)',
                                    mb: 2,
                                    boxShadow: '0 8px 20px rgba(0, 82, 204, 0.3)',
                                }}
                            >
                                <RocketLaunch
                                    sx={{
                                        fontSize: 32,
                                        color: 'white',
                                        transform: 'rotate(-15deg)'
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: '#0052CC',
                                    fontWeight: 800,
                                    mb: 1,
                                    background: 'linear-gradient(135deg, #0052CC, #0747A6)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                TaskFlow
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: '#6B778C',
                                    fontWeight: 500,
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Streamline Your Workflow
                            </Typography>
                        </Box>

                        {/* API Contract: Error display format */}
                        {error && (
                            <Fade in={!!error}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        border: '1px solid #ffcdd2',
                                        backgroundColor: '#ffebee',
                                        '& .MuiAlert-icon': {
                                            color: '#d32f2f',
                                        },
                                    }}
                                    onClose={() => dispatch(clearError())}
                                >
                                    {typeof error === 'string'
                                        ? error
                                        : error.details
                                            ? Object.values(error.details).join(', ')
                                            : 'Invalid credentials'
                                    }
                                </Alert>
                            </Fade>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Username or Email"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                margin="normal"
                                required
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline sx={{ color: '#0052CC' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            '& fieldset': {
                                                borderColor: '#0052CC',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            '& fieldset': {
                                                borderWidth: '2px',
                                                borderColor: '#0052CC',
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#0052CC',
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                margin="normal"
                                required
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ color: '#0052CC' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                                sx={{ color: '#6B778C' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            '& fieldset': {
                                                borderColor: '#0052CC',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            '& fieldset': {
                                                borderWidth: '2px',
                                                borderColor: '#0052CC',
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#0052CC',
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={
                                    loading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <LoginIcon />
                                    )
                                }
                                sx={{
                                    mt: 4,
                                    mb: 3,
                                    py: 1.8,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #0052CC, #0747A6)',
                                    boxShadow: '0 6px 20px rgba(0, 82, 204, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #0747A6, #0052CC)',
                                        boxShadow: '0 8px 25px rgba(0, 82, 204, 0.5)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                    },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.3s ease',
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Sign In to Dashboard'}
                            </Button>

                            <Box textAlign="center" mt={3}>
                                <Link
                                    href="/forgot-password"
                                    variant="body2"
                                    sx={{
                                        color: '#0052CC',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: '#0747A6',
                                            textDecoration: 'underline',
                                            gap: 1,
                                        },
                                    }}
                                >
                                    Forgot your password?
                                </Link>
                            </Box>

                            {/* Demo credentials */}
                            <Box
                                sx={{
                                    mt: 4,
                                    pt: 3,
                                    borderTop: '1px solid rgba(0, 82, 204, 0.1)',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#6B778C',
                                        fontWeight: 500,
                                        mb: 1.5,
                                        textAlign: 'center',
                                    }}
                                >
                                    API Contract Test Credentials
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: 2,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(0, 82, 204, 0.05)',
                                            border: '1px solid rgba(0, 82, 204, 0.1)',
                                            minWidth: 180,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#0052CC',
                                                fontWeight: 600,
                                                display: 'block',
                                            }}
                                        >
                                            Username
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#6B778C',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            admin
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(0, 82, 204, 0.05)',
                                            border: '1px solid rgba(0, 82, 204, 0.1)',
                                            minWidth: 180,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#0052CC',
                                                fontWeight: 600,
                                                display: 'block',
                                            }}
                                        >
                                            Password
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#6B778C',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            password123
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </form>
                    </Card>
                </Container>
            </Fade>
        </Box>
    );
};

export default Login;