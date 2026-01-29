import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Alert,
    useTheme,
    useMediaQuery,
    Stack,
    Tooltip,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Folder as FolderIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { fetchProjects } from '../../app/slices/projectSlice.js'; // ✅ Only this import
import ProjectModal from '../../components/modals/ProjectModal.jsx';
import Loader from '../../components/common/Loader.jsx';
import { setCurrentProject } from '../../app/slices/projectContextSlice';
import { projectsAPI } from '../../api/projects.api.js'; // ✅ Add this

const ProjectList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: projects, loading } = useSelector((state) => state.projects);
    const { user } = useSelector((state) => state.auth);

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [openModal, setOpenModal] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        console.log('📥 Fetching projects...');
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleViewProject = (project) => {
        console.log('🎯 Viewing project:', project.name, 'ID:', project.id);
        dispatch(setCurrentProject(project));
        navigate(`/projects/${project.id}`);
    };

    const handleEditProject = (project, e) => {
        e.stopPropagation();
        console.log('✏️ Editing project:', project.name);
        setEditingProject(project);
        setOpenModal(true);
    };

    const handleDeleteClick = (project, e) => {
        e.stopPropagation();
        console.log('🗑️ Delete clicked for:', project.name);
        setSelectedProject(project);
        setDeleteDialog(true);
    };

    // ✅ Direct API call - No Redux needed
    const handleDeleteConfirm = async () => {
        try {
            setDeleting(true);
            console.log('🗑️ Deleting project:', selectedProject.id);
            
            // Direct API call
            await projectsAPI.deleteProject(selectedProject.id);
            
            console.log('✅ Project deleted successfully');
            setSuccessMessage(`Project "${selectedProject.name}" deleted successfully!`);
            
            // Refresh projects list
            dispatch(fetchProjects());
            
            setDeleteDialog(false);
            setSelectedProject(null);
        } catch (error) {
            console.error('❌ Failed to delete project:', error);
            setErrorMessage(error.response?.data?.error || 'Failed to delete project');
        } finally {
            setDeleting(false);
        }
    };

    const handleModalClose = () => {
        setOpenModal(false);
        setEditingProject(null);
    };

    const handleModalSuccess = () => {
        setSuccessMessage(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
        setOpenModal(false);
        setEditingProject(null);
        dispatch(fetchProjects());
    };

    const canCreateProject = ['ORG_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role);
    const canDeleteProject = ['ORG_ADMIN', 'ADMIN'].includes(user?.role);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return { bg: '#E3FCEF', color: '#064', border: '#ABF5D1' };
            case 'ON_HOLD': return { bg: '#FFFAE6', color: '#FF8B00', border: '#FFE380' };
            case 'COMPLETED': return { bg: '#E3F2FD', color: '#0052CC', border: '#90CAF9' };
            default: return { bg: '#F4F5F7', color: '#6B778C', border: '#DFE1E6' };
        }
    };

    if (loading) return <Loader />;

    return (
        <Box 
            sx={{ 
                p: 3, 
                bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', 
                minHeight: '100vh' 
            }}
        >
            {/* Success Alert */}
            {successMessage && (
                <Alert
                    severity="success"
                    sx={{ mb: 3, borderRadius: '12px' }}
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

            {/* Error Alert */}
            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: '12px' }}
                    onClose={() => setErrorMessage('')}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={isMobile ? 'flex-start' : 'center'}
                    flexDirection={isMobile ? 'column' : 'row'}
                    gap={2}
                    mb={2}
                >
                    <Box>
                        <Typography 
                            variant="h4" 
                            fontWeight="700"
                            sx={{
                                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <FolderIcon /> Projects
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {projects.length} active projects
                        </Typography>
                    </Box>

                    {canCreateProject && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditingProject(null);
                                setOpenModal(true);
                            }}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                px: 3,
                                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #2563EB 30%, #7C3AED 90%)',
                                }
                            }}
                        >
                            Create Project
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <Paper 
                    sx={{ 
                        p: 8, 
                        textAlign: 'center', 
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    }}
                >
                    <FolderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                        No Projects Yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Create your first project to get started
                    </Typography>
                    {canCreateProject && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenModal(true)}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                            }}
                        >
                            Create First Project
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((project) => {
                        const statusStyle = getStatusColor(project.status);
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={project.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        borderRadius: '16px',
                                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                                        border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: isDarkMode 
                                                ? '0 8px 24px rgba(0,0,0,0.4)' 
                                                : '0 8px 24px rgba(0,0,0,0.1)',
                                            borderColor: theme.palette.primary.main,
                                        }
                                    }}
                                    onClick={() => handleViewProject(project)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Header */}
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box flex={1}>
                                                <Typography 
                                                    variant="h6" 
                                                    fontWeight="600" 
                                                    gutterBottom
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {project.name}
                                                </Typography>
                                                <Chip
                                                    label={project.key}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: isDarkMode ? '#22272B' : '#E3FCEF',
                                                        color: isDarkMode ? '#4BCE97' : '#064',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        height: 22,
                                                    }}
                                                />
                                            </Box>
                                            
                                            <Chip
                                                label={project.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: isDarkMode ? '#22272B' : statusStyle.bg,
                                                    color: statusStyle.color,
                                                    fontWeight: 500,
                                                    fontSize: '0.7rem',
                                                    height: 22,
                                                    border: `1px solid ${statusStyle.border}`,
                                                }}
                                            />
                                        </Box>

                                        <Typography 
                                            variant="body2" 
                                            color="textSecondary" 
                                            sx={{
                                                mb: 3,
                                                minHeight: 40,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {project.description || 'No description provided'}
                                        </Typography>

                                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 28, 
                                                    height: 28, 
                                                    bgcolor: 'primary.main',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {project.project_lead?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    Project Lead
                                                </Typography>
                                                <Typography variant="body2" fontWeight="500">
                                                    {project.project_lead}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Stack spacing={0.5} sx={{ mb: 2 }}>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(project.start_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                    {' → '}
                                                    {new Date(project.end_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Box display="flex" gap={1} mt={2}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewProject(project);
                                                    }}
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        '&:hover': {
                                                            bgcolor: 'primary.dark',
                                                        },
                                                        width: 32,
                                                        height: 32,
                                                    }}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {canCreateProject && (
                                                <Tooltip title="Edit Project">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleEditProject(project, e)}
                                                        sx={{
                                                            bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                                            '&:hover': {
                                                                bgcolor: 'info.main',
                                                                color: 'white',
                                                            },
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {canDeleteProject && (
                                                <Tooltip title="Delete Project">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleDeleteClick(project, e)}
                                                        sx={{
                                                            bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                                            '&:hover': {
                                                                bgcolor: 'error.main',
                                                                color: 'white',
                                                            },
                                                            width: 32,
                                                            height: 32,
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <ProjectModal
                open={openModal}
                onClose={handleModalClose}
                project={editingProject}
                onSuccess={handleModalSuccess}
            />

            <Dialog
                open={deleteDialog}
                onClose={() => !deleting && setDeleteDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    }
                }}
            >
                <DialogTitle>Delete Project</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete project <strong>"{selectedProject?.name}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        ⚠️ Warning: This action cannot be undone. All associated sprints and tasks will be deleted.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setDeleteDialog(false)}
                        disabled={deleting}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                        color="error"
                        variant="contained"
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        {deleting ? 'Deleting...' : 'Delete Project'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectList;