import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Alert,
    useTheme as useMuiTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { fetchProjects } from '../../app/slices/projectSlice.js';
import ProjectModal from '../../components/modals/ProjectModal.jsx';
import Loader from '../../components/common/Loader.jsx';
import { setCurrentProject } from '../../app/slices/projectContextSlice';

const ProjectList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: projects, loading } = useSelector((state) => state.projects);
    const { user } = useSelector((state) => state.auth);

    const { darkMode } = useTheme();

    // Responsive hooks
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));

    const [openModal, setOpenModal] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleViewProject = (project) => {
        dispatch(setCurrentProject(project));   // 🔒 LOCK PROJECT
        navigate(`/projects/${project.id}`);
    };

    const handleEditProject = (project) => {
        // Open edit modal (you'll need to update ProjectModal for edit mode)
        console.log('Edit project:', project);
    };

    const handleDeleteClick = (project) => {
        setSelectedProject(project);
        setDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        // Mock delete - in real app, call API
        console.log('Deleting project:', selectedProject);
        setSuccessMessage(`Project "${selectedProject.name}" deleted successfully!`);
        setDeleteDialog(false);
        setSelectedProject(null);

        // In real app: dispatch(deleteProject(selectedProject.id))
    };

    // Only Admin/Manager can create projects (as per API rules)
    const canCreateProject = ['ORG_ADMIN', 'MANAGER'].includes(user?.role);
    // Only Admin can delete projects
    const canDeleteProject = user?.role === 'ORG_ADMIN';

    // Responsive styles
    const responsiveStyles = {
        mainContainer: {
            padding: isMobile ? '12px' : '24px',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
        },
        headerContainer: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '16px' : '0',
            marginBottom: isMobile ? '16px' : '24px',
        },
        heading: {
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            fontWeight: 'bold',
        },
        button: {
            minHeight: '44px',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            padding: isMobile ? '8px 16px' : '10px 20px',
            width: isMobile ? '100%' : 'auto',
        },
        tableContainer: {
            overflowX: 'auto',
            border: darkMode ? '1px solid #3D444D' : '1px solid #C1C7D0',
            backgroundColor: darkMode ? '#1D2125' : 'inherit',
            maxWidth: '100%',
        },
        table: {
            minWidth: isMobile ? '700px' : 'auto', // Minimum width for mobile scrolling
        },
        tableHead: {
            backgroundColor: darkMode ? '#2C333A' : '#F4F5F7',
            borderBottom: darkMode ? '2px solid #3D444D' : '2px solid #A5ADBA',
        },
        tableCell: {
            fontWeight: 'bold',
            color: darkMode ? '#B6C2CF' : '#172B4D',
            borderRight: darkMode ? '1px solid #3D444D' : '1px solid #DFE1E6',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            padding: isMobile ? '12px 8px' : '16px',
        },
        tableBodyCell: {
            borderRight: darkMode ? '1px solid #3D444D' : '1px solid #E6E8EB',
            padding: isMobile ? '12px 8px' : '16px',
            fontSize: isMobile ? '0.875rem' : '1rem',
        },
        projectNameCell: {
            maxWidth: isMobile ? '150px' : '300px',
            minWidth: isMobile ? '120px' : '200px',
        },
        projectKeyCell: {
            minWidth: isMobile ? '80px' : '100px',
        },
        statusCell: {
            minWidth: isMobile ? '80px' : '100px',
        },
        leadCell: {
            minWidth: isMobile ? '100px' : '150px',
        },
        actionsCell: {
            minWidth: isMobile ? '120px' : '150px',
        },
        descriptionText: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            maxWidth: isMobile ? '140px' : '280px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        chip: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            height: isMobile ? '24px' : '32px',
        },
        avatar: {
            width: isMobile ? '24px' : '28px',
            height: isMobile ? '24px' : '28px',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
        },
        iconButton: {
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            padding: isMobile ? '6px' : '8px',
        },
        icon: {
            fontSize: isMobile ? '18px' : '20px',
        },
        emptyState: {
            padding: isMobile ? '40px 16px' : '64px',
        },
        dialog: {
            '& .MuiDialog-paper': {
                margin: isMobile ? '16px' : '32px',
                width: isMobile ? 'calc(100% - 32px)' : '500px',
                maxWidth: '100%',
            }
        },
        dialogContent: {
            padding: isMobile ? '16px' : '24px',
        },
    };

    if (loading) return <Loader />;

    return (
        <Box style={responsiveStyles.mainContainer}>
            {/* Success Alert */}
            {successMessage && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSuccessMessage('')}
                >
                    {successMessage}
                </Alert>
            )}

            <Box style={responsiveStyles.headerContainer}>
                <Typography variant="h4" fontWeight="bold" style={responsiveStyles.heading}>
                    Projects
                </Typography>
                {canCreateProject && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                        style={responsiveStyles.button}
                    >
                        Create Project
                    </Button>
                )}
            </Box>

            {/* Table view as per document requirement */}
            <TableContainer
                component={Paper}
                style={responsiveStyles.tableContainer}
            >
                <Table style={responsiveStyles.table}>
                    <TableHead style={responsiveStyles.tableHead}>
                        <TableRow>
                            <TableCell style={{ ...responsiveStyles.tableCell, ...responsiveStyles.projectNameCell }}>
                                Project Name
                            </TableCell>
                            <TableCell style={{ ...responsiveStyles.tableCell, ...responsiveStyles.projectKeyCell }}>
                                Project Key
                            </TableCell>
                            <TableCell style={{ ...responsiveStyles.tableCell, ...responsiveStyles.statusCell }}>
                                Status
                            </TableCell>
                            <TableCell style={{ ...responsiveStyles.tableCell, ...responsiveStyles.leadCell }}>
                                Project Lead
                            </TableCell>
                            <TableCell style={{ ...responsiveStyles.tableCell, ...responsiveStyles.actionsCell }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects.map((project, index) => (
                            <TableRow
                                key={project.id}
                                hover
                                sx={{
                                    '&:hover': {
                                        backgroundColor: darkMode ? '#2C333A' : '#F8FAFF',
                                    },
                                    backgroundColor: index % 2 === 0
                                        ? (darkMode ? '#1D2125' : '#FFFFFF')
                                        : (darkMode ? '#252A31' : '#FAFBFC'),
                                    borderBottom: darkMode ? '1px solid #3D444D' : '1px solid #DFE1E6',
                                    '&:last-child': {
                                        borderBottom: darkMode ? '1px solid #3D444D' : '1px solid #C1C7D0',
                                    }
                                }}
                            >
                                {/* Project Name Cell */}
                                <TableCell style={{
                                    ...responsiveStyles.tableBodyCell,
                                    ...responsiveStyles.projectNameCell,
                                    borderLeft: '2px solid transparent',
                                    '&:hover': {
                                        borderLeft: '2px solid #0052CC',
                                    }
                                }}>
                                    <Box>
                                        <Typography fontWeight="medium" color={darkMode ? '#FFFFFF' : '#172B4D'}>
                                            {project.name}
                                        </Typography>
                                        {project.description && (
                                            <Typography
                                                variant="body2"
                                                color={darkMode ? '#8C9BAB' : '#6B778C'}
                                                sx={{ mt: 0.5 }}
                                                style={responsiveStyles.descriptionText}
                                            >
                                                {project.description.substring(0, isMobile ? 30 : 50)}...
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Project Key Cell */}
                                <TableCell style={{
                                    ...responsiveStyles.tableBodyCell,
                                    ...responsiveStyles.projectKeyCell
                                }}>
                                    <Chip
                                        label={project.key}
                                        sx={{
                                            backgroundColor: darkMode ? '#252A31' : '#E3FCEF',
                                            color: darkMode ? '#4BCE97' : '#064',
                                            fontWeight: 600,
                                            border: darkMode ? '1px solid #4BCE97' : '1.5px solid #ABF5D1',
                                            borderRadius: '2px',
                                        }}
                                        style={responsiveStyles.chip}
                                    />
                                </TableCell>

                                {/* Status Cell */}
                                <TableCell style={{
                                    ...responsiveStyles.tableBodyCell,
                                    ...responsiveStyles.statusCell
                                }}>
                                    <Chip
                                        label={project.status}
                                        sx={{
                                            backgroundColor: project.status === 'ACTIVE'
                                                ? (darkMode ? '#1C3329' : '#E3FCEF')
                                                : project.status === 'ON_HOLD'
                                                    ? (darkMode ? '#38291E' : '#FFFAE6')
                                                    : (darkMode ? '#2C333A' : '#F4F5F7'),
                                            color: project.status === 'ACTIVE'
                                                ? (darkMode ? '#4BCE97' : '#064')
                                                : project.status === 'ON_HOLD'
                                                    ? (darkMode ? '#FAA53D' : '#FF8B00')
                                                    : (darkMode ? '#8C9BAB' : '#6B778C'),
                                            fontWeight: 500,
                                            border: project.status === 'ACTIVE'
                                                ? (darkMode ? '1px solid #4BCE97' : '1.5px solid #ABF5D1')
                                                : project.status === 'ON_HOLD'
                                                    ? (darkMode ? '1px solid #FAA53D' : '1.5px solid #FFE380')
                                                    : (darkMode ? '1px solid #3D444D' : '1.5px solid #DFE1E6'),
                                            borderRadius: '2px',
                                        }}
                                        size="small"
                                        style={responsiveStyles.chip}
                                    />
                                </TableCell>

                                {/* Project Lead Cell */}
                                <TableCell style={{
                                    ...responsiveStyles.tableBodyCell,
                                    ...responsiveStyles.leadCell
                                }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar sx={{
                                            width: responsiveStyles.avatar.width,
                                            height: responsiveStyles.avatar.height,
                                            bgcolor: darkMode ? '#579DFF' : '#0052CC',
                                            fontSize: responsiveStyles.avatar.fontSize,
                                            border: darkMode ? '1px solid #3D444D' : '1px solid #C1C7D0',
                                            borderRadius: '2px',
                                        }}>
                                            {project.project_lead?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography
                                            color={darkMode ? '#FFFFFF' : '#172B4D'}
                                            fontWeight={500}
                                            fontSize={isMobile ? '0.875rem' : '1rem'}
                                        >
                                            {project.project_lead}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Actions Cell */}
                                <TableCell style={responsiveStyles.actionsCell}>
                                    <Box display="flex" gap={1}>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => handleViewProject(project)}

                                            title="View Project"
                                            sx={{
                                                backgroundColor: darkMode ? 'rgba(87, 157, 255, 0.1)' : 'rgba(0, 82, 204, 0.08)',
                                                border: darkMode ? '1px solid #579DFF' : '1px solid rgba(0, 82, 204, 0.2)',
                                                borderRadius: '2px',
                                                '&:hover': {
                                                    backgroundColor: darkMode ? 'rgba(87, 157, 255, 0.2)' : 'rgba(0, 82, 204, 0.12)',
                                                }
                                            }}
                                            style={responsiveStyles.iconButton}
                                        >
                                            <ViewIcon fontSize="small" style={responsiveStyles.icon} />
                                        </IconButton>

                                        {canCreateProject && (
                                            <IconButton
                                                color="info"
                                                size="small"
                                                onClick={() => handleEditProject(project)}
                                                title="Edit Project"
                                                sx={{
                                                    backgroundColor: darkMode ? 'rgba(0, 199, 229, 0.1)' : 'rgba(0, 184, 217, 0.08)',
                                                    border: darkMode ? '1px solid #00C7E5' : '1px solid rgba(0, 184, 217, 0.2)',
                                                    borderRadius: '2px',
                                                    '&:hover': {
                                                        backgroundColor: darkMode ? 'rgba(0, 199, 229, 0.2)' : 'rgba(0, 184, 217, 0.12)',
                                                    }
                                                }}
                                                style={responsiveStyles.iconButton}
                                            >
                                                <EditIcon fontSize="small" style={responsiveStyles.icon} />
                                            </IconButton>
                                        )}

                                        {canDeleteProject && (
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteClick(project)}
                                                title="Delete Project"
                                                sx={{
                                                    backgroundColor: darkMode ? 'rgba(227, 72, 80, 0.1)' : 'rgba(222, 53, 11, 0.08)',
                                                    border: darkMode ? '1px solid #E34850' : '1px solid rgba(222, 53, 11, 0.2)',
                                                    borderRadius: '2px',
                                                    '&:hover': {
                                                        backgroundColor: darkMode ? 'rgba(227, 72, 80, 0.2)' : 'rgba(222, 53, 11, 0.12)',
                                                    }
                                                }}
                                                style={responsiveStyles.iconButton}
                                            >
                                                <DeleteIcon fontSize="small" style={responsiveStyles.icon} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {projects.length === 0 && (
                <Box textAlign="center" style={responsiveStyles.emptyState}>
                    <Typography variant="h6" color="textSecondary">
                        No projects found
                    </Typography>
                    {canCreateProject && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenModal(true)}
                            sx={{ mt: 2 }}
                            style={responsiveStyles.button}
                        >
                            Create your first project
                        </Button>
                    )}
                </Box>
            )}

            {/* Create/Edit Project Modal */}
            <ProjectModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                project={null} // For create mode
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                style={responsiveStyles.dialog}
            >
                <DialogTitle>Delete Project</DialogTitle>
                <DialogContent style={responsiveStyles.dialogContent}>
                    <Typography>
                        Are you sure you want to delete project <strong>"{selectedProject?.name}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        Warning: This action cannot be undone. All associated sprints and tasks will be deleted.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        style={responsiveStyles.button}
                    >
                        Delete Project
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectList;