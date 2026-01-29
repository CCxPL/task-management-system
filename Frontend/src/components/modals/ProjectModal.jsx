import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    useTheme,
    Typography,  // ✅ ADD THIS
    Alert,       // ✅ ADD THIS TOO (better for errors)
} from '@mui/material';
import { createProject } from '../../app/slices/projectSlice';
import { projectsAPI } from '../../api/projects.api';

const ProjectModal = ({ open, onClose, project, onSuccess }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const isEditMode = !!project;
    
    const [formData, setFormData] = useState({
        name: '',
        key: '',
        description: '',
        status: 'ACTIVE',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (project && open) {
            console.log('✏️ Edit mode - Loading project:', project);
            setFormData({
                name: project.name || '',
                key: project.key || '',
                description: project.description || '',
                status: project.status || 'ACTIVE',
            });
        } else {
            setFormData({
                name: '',
                key: '',
                description: '',
                status: 'ACTIVE',
            });
        }
        setError('');
    }, [project, open]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                console.log('📝 Updating project:', project.id, formData);
                await projectsAPI.updateProject(project.id, {
                    name: formData.name,
                    description: formData.description,
                });
                console.log('✅ Project updated successfully');
            } else {
                console.log('📝 Creating new project:', formData);
                await dispatch(createProject(formData)).unwrap();
                console.log('✅ Project created successfully');
            }

            setFormData({
                name: '',
                key: '',
                description: '',
                status: 'ACTIVE',
            });
            
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
        } catch (err) {
            console.error('❌ Failed to save project:', err);
            setError(err.response?.data?.error || err.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            key: '',
            description: '',
            status: 'ACTIVE',
        });
        setError('');
        onClose();
    };

    return (
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
            <DialogTitle>
                {isEditMode ? `Edit Project: ${project?.name}` : 'Create New Project'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {/* ✅ Better Error Display */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Project Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Project Key"
                                name="key"
                                value={formData.key}
                                onChange={handleChange}
                                required
                                disabled={isEditMode}
                                margin="normal"
                                helperText={isEditMode ? "Project key cannot be changed" : "Short code like DEV, WEB, MOB"}
                                inputProps={{ maxLength: 10 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                margin="normal"
                            />
                        </Grid>
                        {!isEditMode && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    margin="normal"
                                >
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="ON_HOLD">On Hold</MenuItem>
                                    <MenuItem value="COMPLETED">Completed</MenuItem>
                                </TextField>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleClose} 
                        disabled={loading}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        sx={{ 
                            borderRadius: '8px', 
                            textTransform: 'none',
                            background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        }}
                    >
                        {loading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProjectModal;