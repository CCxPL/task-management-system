import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Link,
    Container,
    Grid,
    Paper,
    CircularProgress,
    InputAdornment,
    Fade
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    EmailOutlined,
    CheckCircle,
    LockReset
} from '@mui/icons-material';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            setLoading(false);
            if (email.includes('@')) {
                setSuccess(true);
            } else {
                setError('Please enter a valid email address');
            }
        }, 1000);
    };

    return (
        <Container maxWidth="sm" sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
        }}>
            <Fade in={true} timeout={600}>
                <Paper elevation={8} sx={{
                    width: '100%',
                    maxWidth: 500,
                    p: { xs: 3, sm: 4, md: 5 },
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    }
                }}>
                    {/* Success State */}
                    {success ? (
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3,
                                boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)'
                            }}>
                                <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
                            </Box>

                            <Typography variant="h5" fontWeight="700" gutterBottom color="#2d3748">
                                Check Your Email
                            </Typography>

                            <Alert
                                severity="success"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    backgroundColor: '#f0f9ff',
                                    border: '1px solid #bae6fd'
                                }}
                            >
                                <Typography variant="body2">
                                    Password reset instructions have been sent to <strong>{email}</strong>
                                </Typography>
                            </Alert>

                            <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
                                We've sent a password reset link to your email address.
                                Please check your inbox and follow the instructions.
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => navigate('/login')}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                    }
                                }}
                            >
                                Return to Login
                            </Button>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                                Didn't receive the email?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => setSuccess(false)}
                                    sx={{
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        color: '#667eea',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Try again
                                </Link>
                            </Typography>
                        </Box>
                    ) : (
                        /* Form State */
                        <Box>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Box sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                                }}>
                                    <LockReset sx={{ fontSize: 28, color: 'white' }} />
                                </Box>
                                <Typography variant="h5" fontWeight="700" color="#2d3748" gutterBottom>
                                    Reset Password
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Enter your email to receive password reset instructions
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <Fade in={!!error}>
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mb: 3,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: 'error.main'
                                            }}
                                        >
                                            {error}
                                        </Alert>
                                    </Fade>
                                )}

                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    margin="normal"
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlined sx={{ color: 'action.active' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&.Mui-focused': {
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                            }
                                        }
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading || !email}
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
                                        },
                                        '&.Mui-disabled': {
                                            background: 'linear-gradient(90deg, #cccccc 0%, #999999 100%)',
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Send Reset Instructions'
                                    )}
                                </Button>

                                <Box textAlign="center" mt={3}>
                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1,
                                            color: '#667eea',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        <BackIcon fontSize="small" />
                                        Back to Login
                                    </Link>
                                </Box>
                            </form>

                            {/* Info Box */}
                            <Box sx={{
                                mt: 4,
                                p: 2.5,
                                borderRadius: 2,
                                backgroundColor: '#f8f9ff',
                                border: '1px solid #e0e7ff'
                            }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    💡 What to expect:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                    • Check your email within 5 minutes
                                    <br />
                                    • The link expires in 24 hours
                                    <br />
                                    • Contact support if you don't receive the email
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Fade>
        </Container>
    );
};

export default ForgotPassword;