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
    const [issues, setIssues] = useState([]); // ✅ Initialize as array
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
            
            // ✅ Fetch data sequentially with proper error handling
            const projectData = await projectsAPI.getProjectById(id);
            console.log('📂 Project data:', projectData);
            setProject(projectData);
            
            const sprintsData = await sprintsAPI.getSprintsByProject(id);
            console.log('🏃 Sprints data:', sprintsData);
            setSprints(Array.isArray(sprintsData) ? sprintsData : []);
            
            const issuesData = await issuesAPI.getIssues(id);
            console.log('📋 Issues data:', issuesData, 'Type:', typeof issuesData);
            
            // ✅ CRITICAL: Ensure issues is always an array
            if (Array.isArray(issuesData)) {
                setIssues(issuesData);
            } else if (issuesData && typeof issuesData === 'object' && issuesData.results) {
                setIssues(issuesData.results);
            } else {
                console.warn('⚠️ Issues data is not an array:', issuesData);
                setIssues([]);
            }
            
        } catch (error) {
            console.error('❌ Error fetching project data:', error);
            setProject(null);
            setSprints([]);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenKanban = () => {
        // ✅ Set current project before navigating
        if (project) {
            dispatch(setCurrentProject(project));
        }
        navigate('/kanban');
    };

    if (loading) return <Loader />;
    if (!project) return (
        <Box p={3}>
            <Typography variant="h5" color="error">Project not found</Typography>
            <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
                Back to Projects
            </Button>
        </Box>
    );

    // ✅ Calculate stats with safe array checks
    const activeSprint = Array.isArray(sprints) 
        ? sprints.find(s => s.status === 'ACTIVE') 
        : null;
    
    const taskSummary = {
        total: Array.isArray(issues) ? issues.length : 0,
        todo: Array.isArray(issues) 
            ? issues.filter(i => 
                i.status === 'TO_DO' || 
                i.workflow_status?.slug === 'to-do' ||
                i.workflow_status?.slug === 'backlog'
              ).length 
            : 0, // ✅ FIXED: was "odo"
        inProgress: Array.isArray(issues) 
            ? issues.filter(i => 
                i.status === 'IN_PROGRESS' || 
                i.workflow_status?.slug === 'in-progress'
              ).length 
            : 0,
        done: Array.isArray(issues) 
            ? issues.filter(i => 
                i.status === 'DONE' || 
                i.workflow_status?.slug === 'done'
              ).length 
            : 0,
    };

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
            marginBottom: isMobile ? '20px' : '32px',
        },
        heading: {
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        subHeading: {
            fontSize: isMobile ? '1rem' : '1.25rem',
        },
        chipContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '16px',
        },
        button: {
            minHeight: '44px',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            padding: isMobile ? '8px 16px' : '10px 20px',
            width: isMobile ? '100%' : 'auto',
        },
        gridContainer: {
            margin: isMobile ? '-8px' : '-12px',
            width: 'calc(100% + 16px)',
        },
        gridItem: {
            padding: isMobile ? '8px' : '12px',
        },
        paperContainer: {
            border: '2px solid #00000066',
            borderRadius: 1,
            padding: isMobile ? '16px' : '24px',
            marginBottom: '16px',
            height: 'auto',
        },
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
        listItem: {
            border: '1px solid #00000033',
            borderRadius: 1,
            marginBottom: '8px',
            padding: isMobile ? '8px' : '12px',
            '&:last-child': {
                marginBottom: 0,
            }
        },
        avatar: {
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            fontSize: isMobile ? '0.875rem' : '1rem',
        },
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
                        {project.description || 'No description provided'}
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
                    label={`Lead: ${project.project_lead || 'Not assigned'}`}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                />
                {project.start_date && (
                    <Chip
                        label={`Start: ${new Date(project.start_date).toLocaleDateString()}`}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                    />
                )}
                {project.end_date && (
                    <Chip
                        label={`End: ${new Date(project.end_date).toLocaleDateString()}`}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                    />
                )}
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