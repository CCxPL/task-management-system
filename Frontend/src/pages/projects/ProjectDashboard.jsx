import { setCurrentProject } from '../../app/slices/projectContextSlice';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    People as PeopleIcon,
    PlayArrow as SprintIcon,
    Assignment as TaskIcon,
    Timeline as TimelineIcon,
    ViewKanban as KanbanIcon,
} from '@mui/icons-material';
import { projectsAPI } from '../../api/projects.api.js';
import { sprintsAPI } from '../../api/sprints.api.js';
import { issuesAPI } from '../../api/issues.api.js';
import Loader from '../../components/common/Loader.jsx';

const ProjectDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [project, setProject] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);

    // Responsive hooks
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectData, sprintsData, issuesData] = await Promise.all([
                projectsAPI.getProjectById(id),
                sprintsAPI.getSprintsByProject(id),
                issuesAPI.getIssues(id),
            ]);
            setProject(projectData);
            setSprints(sprintsData);
            setIssues(issuesData);
        } catch (error) {
            console.error('Error fetching project data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenKanban = () => {
        navigate('/kanban');

    };

    if (loading) return <Loader />;
    if (!project) return <Typography>Project not found</Typography>;

    // Calculate stats
    const activeSprint = sprints.find(s => s.status === 'ACTIVE');
    const taskSummary = {
        total: issues.length,
        todo: issues.filter(i => i.status === 'TO_DO').length,
        inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        done: issues.filter(i => i.status === 'DONE').length,
    };

    // Responsive styles
    const responsiveStyles = {
        // Main container
        mainContainer: {
            padding: isMobile ? '12px' : '24px',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
        },

        // Header section
        headerContainer: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '16px' : '0',
            marginBottom: isMobile ? '20px' : '32px',
        },

        // Heading sizes
        heading: {
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },

        subHeading: {
            fontSize: isMobile ? '1rem' : '1.25rem',
        },

        // Chip container
        chipContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '16px',
        },

        // Button responsive
        button: {
            minHeight: '44px',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            padding: isMobile ? '8px 16px' : '10px 20px',
            width: isMobile ? '100%' : 'auto',
        },

        // Grid container
        gridContainer: {
            margin: isMobile ? '-8px' : '-12px',
            width: 'calc(100% + 16px)',
        },

        // Grid item
        gridItem: {
            padding: isMobile ? '8px' : '12px',
        },

        // Paper containers
        paperContainer: {
            border: '2px solid #00000066',
            borderRadius: 1,
            padding: isMobile ? '16px' : '24px',
            marginBottom: '16px',
            height: 'auto',
        },

        // Task summary grid
        taskGridContainer: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '16px',
            marginTop: isMobile ? '16px' : '24px',
        },

        taskGridItem: {
            width: isMobile ? '100%' : '25%',
            padding: isMobile ? '0' : '0 4px',
        },

        taskPaper: {
            padding: isMobile ? '12px' : '16px',
            textAlign: 'center',
            height: 'auto',
            minHeight: isMobile ? '80px' : '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #00000066',
            borderRadius: 1,
        },

        taskNumber: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 'bold',
            lineHeight: 1,
        },

        taskLabel: {
            fontSize: isMobile ? '0.875rem' : '1rem',
            marginTop: '4px',
        },

        // List items responsive
        listItem: {
            border: '1px solid #00000033',
            borderRadius: 1,
            marginBottom: '8px',
            padding: isMobile ? '8px' : '12px',
            '&:last-child': {
                marginBottom: 0,
            }
        },

        // Avatar size
        avatar: {
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            fontSize: isMobile ? '0.875rem' : '1rem',
        },

        // Typography responsive
        bodyText: {
            fontSize: isMobile ? '0.875rem' : '1rem',
        },

        smallText: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
        },
    };

    return (
        <Box style={responsiveStyles.mainContainer}>
            {/* Project Header */}
            <Box style={responsiveStyles.headerContainer}>
                <Box style={{ width: isMobile ? '100%' : 'auto' }}>
                    <Typography variant="h3" style={responsiveStyles.heading}>
                        {project.name}
                    </Typography>
                    <Typography variant="h6" color="primary" style={responsiveStyles.subHeading}>
                        {project.key}
                    </Typography>
                    <Typography color="textSecondary" mt={1} style={responsiveStyles.bodyText}>
                        {project.description}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<KanbanIcon />}
                    onClick={handleOpenKanban}
                    style={responsiveStyles.button}
                >
                    Open Kanban Board
                </Button>
            </Box>

            <Box style={responsiveStyles.chipContainer}>
                <Chip
                    label={`Status: ${project.status}`}
                    color="primary"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                />
                <Chip
                    label={`Lead: ${project.project_lead}`}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                />
                <Chip
                    label={`Start: ${new Date(project.start_date).toLocaleDateString()}`}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                />
                <Chip
                    label={`End: ${new Date(project.end_date).toLocaleDateString()}`}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                />
            </Box>

            <Grid container style={responsiveStyles.gridContainer}>
                {/* Project Overview */}
                <Grid item xs={12} md={8} style={responsiveStyles.gridItem}>
                    <Paper style={responsiveStyles.paperContainer}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Project Overview
                        </Typography>
                        <Typography color="textSecondary" paragraph style={responsiveStyles.bodyText}>
                            {project.description || 'No description provided.'}
                        </Typography>

                        {/* Task Summary */}
                        <Box style={{ marginTop: isMobile ? '20px' : '32px' }}>
                            <Typography variant="h6" gutterBottom>
                                Task Summary
                            </Typography>
                            <Box style={responsiveStyles.taskGridContainer}>
                                <Box style={responsiveStyles.taskGridItem}>
                                    <Paper style={{ ...responsiveStyles.taskPaper, bgcolor: 'primary.light', color: 'white' }}>
                                        <Typography variant="h4" style={responsiveStyles.taskNumber}>
                                            {taskSummary.total}
                                        </Typography>
                                        <Typography style={responsiveStyles.taskLabel}>Total Tasks</Typography>
                                    </Paper>
                                </Box>
                                <Box style={responsiveStyles.taskGridItem}>
                                    <Paper style={{ ...responsiveStyles.taskPaper, bgcolor: 'info.light', color: 'white' }}>
                                        <Typography variant="h4" style={responsiveStyles.taskNumber}>
                                            {taskSummary.todo}
                                        </Typography>
                                        <Typography style={responsiveStyles.taskLabel}>To Do</Typography>
                                    </Paper>
                                </Box>
                                <Box style={responsiveStyles.taskGridItem}>
                                    <Paper style={{ ...responsiveStyles.taskPaper, bgcolor: 'warning.light', color: 'white' }}>
                                        <Typography variant="h4" style={responsiveStyles.taskNumber}>
                                            {taskSummary.inProgress}
                                        </Typography>
                                        <Typography style={responsiveStyles.taskLabel}>In Progress</Typography>
                                    </Paper>
                                </Box>
                                <Box style={responsiveStyles.taskGridItem}>
                                    <Paper style={{ ...responsiveStyles.taskPaper, bgcolor: 'success.light', color: 'white' }}>
                                        <Typography variant="h4" style={responsiveStyles.taskNumber}>
                                            {taskSummary.done}
                                        </Typography>
                                        <Typography style={responsiveStyles.taskLabel}>Done</Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Sidebar - Active Sprint & Members */}
                <Grid item xs={12} md={4} style={responsiveStyles.gridItem}>
                    {/* Active Sprint */}
                    {activeSprint && (
                        <Paper style={{ ...responsiveStyles.paperContainer, marginBottom: '20px' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <SprintIcon color="primary" sx={{ mr: 1, fontSize: isMobile ? '20px' : '24px' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Active Sprint
                                </Typography>
                            </Box>
                            <Typography variant="h6" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                                {activeSprint.name}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom style={responsiveStyles.bodyText}>
                                {activeSprint.goal}
                            </Typography>
                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" style={responsiveStyles.smallText}>
                                    {new Date(activeSprint.start_date).toLocaleDateString()} -{' '}
                                    {new Date(activeSprint.end_date).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => navigate(`/sprints/${activeSprint.id}`)}
                                style={responsiveStyles.button}
                            >
                                View Sprint Board
                            </Button>
                        </Paper>
                    )}

                    {/* Members List */}
                    <Paper style={responsiveStyles.paperContainer}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <PeopleIcon color="primary" sx={{ mr: 1, fontSize: isMobile ? '20px' : '24px' }} />
                            <Typography variant="h6" fontWeight="bold">
                                Team Members
                            </Typography>
                        </Box>
                        <List>
                            {['Admin User', 'Manager User', 'Developer 1', 'Developer 2'].map((member, index) => (
                                <React.Fragment key={index}>
                                    <ListItem style={responsiveStyles.listItem}>
                                        <ListItemAvatar>
                                            <Avatar style={responsiveStyles.avatar}>{member.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={member}
                                            secondary="Team Member"
                                            primaryTypographyProps={{
                                                style: {
                                                    fontWeight: 500,
                                                    fontSize: isMobile ? '0.875rem' : '1rem'
                                                }
                                            }}
                                            secondaryTypographyProps={{
                                                style: {
                                                    color: '#666',
                                                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                                                }
                                            }}
                                        />
                                    </ListItem>
                                    {index < 3 && <Divider sx={{ borderColor: '#00000033' }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProjectDashboard;