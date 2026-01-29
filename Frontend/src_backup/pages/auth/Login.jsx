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
    Fade,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    Login as LoginIcon,
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Google,
    Facebook,
    Assignment,
    Schedule,
} from '@mui/icons-material';
import { login, clearError } from '../../app/slices/authSlice';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error, user } = useSelector((state) => state.auth);

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

        if (!formData.username.trim() || !formData.password.trim()) {
            dispatch(clearError());
        }

        const credentials = {
            username: formData.username,
            password: formData.password,
        };

        const result = await dispatch(login(credentials));

        if (!result.error) {
            navigate('/dashboard');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            {/* Left Side - Form */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa',
                    p: { xs: 4, md: 8 },
                    minHeight: { xs: '50vh', md: '100vh' },
                }}
            >
                <Fade in={true} timeout={600}>
                    <Box sx={{ width: '100%', maxWidth: '420px' }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                mb: 4,
                                color: '#2d3748',
                            }}
                        >
                            Login to your account
                        </Typography>



                        {/* Error Alert */}
                        {error && (
                            <Fade in={!!error}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                    }}
                                    onClose={() => dispatch(clearError())}
                                >
                                    {typeof error === 'string'
                                        ? error
                                        : error.details
                                            ? Object.values(error.details).join(', ')
                                            : 'Invalid credentials'}
                                </Alert>
                            </Fade>
                        )}

                        {/* Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            <Box mb={2.5}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#2d3748',
                                        mb: 1,
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your email"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email sx={{ color: '#a0aec0', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            '& fieldset': {
                                                borderColor: '#e2e8f0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#cbd5e0',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: 2,
                                            },
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            fontSize: '0.95rem',
                                            '&::placeholder': {
                                                color: '#a0aec0',
                                                opacity: 1,
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <Box mb={2}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#2d3748',
                                        mb: 1,
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    placeholder="Enter your password"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={{ color: '#a0aec0', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    sx={{ color: '#718096' }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'white',
                                            borderRadius: 2,
                                            '& fieldset': {
                                                borderColor: '#e2e8f0',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#cbd5e0',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: 2,
                                            },
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            fontSize: '0.95rem',
                                            '&::placeholder': {
                                                color: '#a0aec0',
                                                opacity: 1,
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 4,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{
                                                color: '#cbd5e0',
                                                '&.Mui-checked': {
                                                    color: '#667eea',
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="body2"
                                            sx={{ color: '#4a5568', fontSize: '0.875rem' }}
                                        >
                                            Remember me
                                        </Typography>
                                    }
                                />
                                <Link
                                    href="/forgot-password"
                                    sx={{
                                        color: '#e53e3e',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    py: 1.8,
                                    borderRadius: 2,
                                    backgroundColor: '#718096',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: '#4a5568',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Login now'
                                )}
                            </Button>

                            <Box textAlign="center" mt={4}>
                                <Typography variant="body2" sx={{ color: '#4a5568' }}>
                                    Don't have an account?{' '}
                                    <Link
                                        href="/register"
                                        sx={{
                                            color: '#e53e3e',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Join free today
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </Box>

            {/* Right Side - Welcome Section */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #c3dafe 0%, #a7f3d0 100%)',
                    p: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        top: '-100px',
                        right: '-100px',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                        bottom: '50px',
                        left: '-50px',
                    },
                }}
            >
                <Fade in={true} timeout={800}>
                    <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '500px' }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: '#2d3748',
                            }}
                        >
                            WELCOME BACK!
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 400,
                                mb: 6,
                                color: '#4a5568',
                                lineHeight: 1.6,
                            }}
                        >
                            You're just one step away from a high-quality task management experience.
                        </Typography>

                        {/* Task Management Icon Illustration */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                mt: 4,
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '250px',
                                    height: '250px',
                                }}
                            >
                                {/* Main Task Board */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: '180px',
                                        height: '220px',
                                        background: '#2d3748',
                                        borderRadius: 4,
                                        left: '0',
                                        top: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 3,
                                        boxShadow: '0 15px 50px rgba(45, 55, 72, 0.3)',
                                    }}
                                >
                                    {/* Clipboard Top */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '-15px',
                                            width: '80px',
                                            height: '30px',
                                            background: '#2d3748',
                                            borderRadius: '8px 8px 0 0',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            pt: 0.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                border: '3px solid white',
                                            }}
                                        />
                                    </Box>

                                    {/* Checkmark Items */}
                                    {[0, 1, 2].map((item) => (
                                        <Box
                                            key={item}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                mb: 2.5,
                                                mt: item === 0 ? 2 : 0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: '28px',
                                                    height: '28px',
                                                    backgroundColor: '#48bb78',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 1.5,
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    fontSize: '1.2rem',
                                                }}
                                            >
                                                ✓
                                            </Box>
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    height: '6px',
                                                    backgroundColor: 'white',
                                                    borderRadius: 1,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Clock Icon */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: '0',
                                        bottom: '0',
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: '#2d3748',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 10px 40px rgba(45, 55, 72, 0.3)',
                                    }}
                                >
                                    <Schedule
                                        sx={{
                                            fontSize: 60,
                                            color: 'white',
                                        }}
                                    />
                                </Box>

                                {/* Pencil */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: '30px',
                                        top: '0',
                                        width: '60px',
                                        height: '12px',
                                        background: 'linear-gradient(90deg, #e2e8f0 50%, #cbd5e0 50%)',
                                        borderRadius: '0 6px 6px 0',
                                        transform: 'rotate(-45deg)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            right: '-10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '10px solid #cbd5e0',
                                            borderTop: '6px solid transparent',
                                            borderBottom: '6px solid transparent',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </Box>
        </Box>
    );
};

export default Login;