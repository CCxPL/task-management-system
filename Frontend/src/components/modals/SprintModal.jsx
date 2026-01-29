import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Alert,
    useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sprintsAPI } from '../../api/sprints.api';

const SprintModal = ({ open, onClose, projectId, sprint, onSuccess }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const { list: sprints } = useSelector((state) => state.sprints || { list: [] });
    
    const isEditMode = !!sprint;
    
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (sprint && open) {
            console.log('✏️ Edit mode - Loading sprint:', sprint);
            setFormData({
                name: sprint.name || '',
                goal: sprint.goal || '',
                start_date: sprint.start_date ? new Date(sprint.start_date) : new Date(),
                end_date: sprint.end_date ? new Date(sprint.end_date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            });
        } else {
            setFormData({
                name: '',
                goal: '',
                start_date: new Date(),
                end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            });
        }
        setError('');
        setValidationErrors({});
    }, [sprint, open]);

    const hasActiveSprint = sprints.some(
        s => s.project === projectId && s.status === 'ACTIVE' && (!isEditMode || s.id !== sprint?.id)
    );

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (validationErrors[e.target.name]) {
            setValidationErrors({
                ...validationErrors,
                [e.target.name]: '',
            });
        }
    };

    const handleDateChange = (name, date) => {
        setFormData({
            ...formData,
            [name]: date,
        });
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: '',
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Sprint name is required';
        }

        if (!formData.start_date) {
            errors.start_date = 'Start date is required';
        }

        if (!formData.end_date) {
            errors.end_date = 'End date is required';
        }

        if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
            errors.end_date = 'End date must be after start date';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!isEditMode && hasActiveSprint) {
            setError('This project already has an active sprint. Only one active sprint allowed per project.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const sprintPayload = {
                name: formData.name.trim(),
                goal: formData.goal.trim(),
                start_date: formData.start_date.toISOString().split('T')[0],
                end_date: formData.end_date.toISOString().split('T')[0],
            };
            
            console.log('📤 Sprint payload:', sprintPayload);
            
            if (isEditMode) {
                console.log('📝 Updating sprint:', sprint.id);
                await sprintsAPI.updateSprint(sprint.id, sprintPayload);
                console.log('✅ Sprint updated successfully');
            } else {
                console.log('📝 Creating sprint for project:', projectId);
                await sprintsAPI.createSprint(projectId, sprintPayload);
                console.log('✅ Sprint created successfully');
            }

            setFormData({
                name: '',
                goal: '',
                start_date: new Date(),
                end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            });
            
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
            
        } catch (error) {
            console.error('❌ Failed to save sprint:', error);
            const errorMsg = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to save sprint';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            goal: '',
            start_date: new Date(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        });
        setError('');
        setValidationErrors({});
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600,
                    pb: 1
                }}>
                    {isEditMode ? `Edit Sprint: ${sprint?.name}` : 'Create New Sprint'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {!isEditMode && hasActiveSprint && (
                            <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
                                This project already has an active sprint. You can only have one active sprint per project.
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                                {error}
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Sprint Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    helperText={validationErrors.name || "e.g., Sprint 1, January Iteration"}
                                    error={!!validationErrors.name}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Sprint Goal"
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    margin="normal"
                                    helperText="What do you want to achieve in this sprint?"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Start Date"
                                    value={formData.start_date}
                                    onChange={(date) => handleDateChange('start_date', date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: 'normal',
                                            required: true,
                                            error: !!validationErrors.start_date,
                                            helperText: validationErrors.start_date,
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="End Date"
                                    value={formData.end_date}
                                    onChange={(date) => handleDateChange('end_date', date)}
                                    minDate={formData.start_date}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: 'normal',
                                            required: true,
                                            error: !!validationErrors.end_date,
                                            helperText: validationErrors.end_date,
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        <Button 
                            onClick={handleClose} 
                            disabled={loading}
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none',
                                px: 3
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || (!isEditMode && hasActiveSprint)}
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none',
                                px: 3,
                                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #2563EB 30%, #7C3AED 90%)',
                                }
                            }}
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Sprint' : 'Create Sprint'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default SprintModal;