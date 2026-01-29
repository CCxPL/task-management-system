import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    LinearProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Add as AddIcon, Flag as GoalIcon } from '@mui/icons-material';
import { sprintsAPI } from '../../api/sprints.api.js';
import { issuesAPI } from '../../api/issues.api.js';
import SprintModal from '../../components/modals/SprintModal.jsx';
import Loader from '../../components/common/Loader.jsx';

const SprintBoard = () => {
    const { id } = useParams();
    console.log('🔵 SprintBoard - id from URL:', id);  // ✅
    console.log('🔵 SprintBoard - id type:', typeof id);  // ✅
    console.log('🔵 SprintBoard - id value:', id);  // ✅
    const dispatch = useDispatch();

    // Responsive hooks
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const [sprint, setSprint] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (id) {
            fetchSprintData();
        }
    }, [id]);

    const fetchSprintData = async () => {
        try {
            setLoading(true);

            // Get sprint data
            const sprintData = await sprintsAPI.getSprintById(id);
            setSprint(sprintData);

            // Get issues with safe handling
            try {
                const issuesData = await issuesAPI.getIssues(null);
                if (Array.isArray(issuesData)) {
                    // Filter issues for this sprint
                    const sprintIssues = issuesData.filter(issue =>
                        issue.sprint === parseInt(id) || issue.sprint == id
                    );
                    setIssues(sprintIssues);
                } else {
                    console.warn('issuesData is not an array:', issuesData);
                    setIssues([]);
                }
            } catch (issuesError) {
                console.warn('Failed to fetch issues:', issuesError);
                setIssues([]);
            }

        } catch (error) {
            console.error('Error fetching sprint data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = () => {
        if (issues.length === 0) return 0;
        const completed = issues.filter(issue => issue.status === 'DONE').length;
        return (completed / issues.length) * 100;
    };

    const getStatusCount = (status) => {
        return issues.filter(issue => issue.status === status).length;
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
            marginBottom: isMobile ? '16px' : '24px',
        },
        heading: {
            fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
        },
        subHeading: {
            fontSize: isMobile ? '1rem' : '1.25rem',
            color: 'textSecondary',
        },
        button: {
            minHeight: '44px',
            fontSize: isMobile ? '0.875rem' : '0.9375rem',
            padding: isMobile ? '8px 16px' : '10px 20px',
            width: isMobile ? '100%' : 'auto',
        },
        goalPaper: {
            padding: isMobile ? '16px' : '24px',
            backgroundColor: 'primary.light',
            color: 'white',
            marginBottom: isMobile ? '16px' : '24px',
        },
        progressPaper: {
            padding: isMobile ? '16px' : '24px',
            marginBottom: isMobile ? '20px' : '32px',
        },
        gridContainer: {
            margin: isMobile ? '-8px' : '-12px',
            width: 'calc(100% + 16px)',
        },
        gridItem: {
            padding: isMobile ? '8px' : '12px',
            width: isMobile ? '100%' : isTablet ? '50%' : '25%',
            flexBasis: isMobile ? '100%' : isTablet ? '50%' : '25%',
            maxWidth: isMobile ? '100%' : isTablet ? '50%' : '25%',
        },
        statusPaper: {
            padding: isMobile ? '12px' : '16px',
            height: '100%',
            minHeight: isMobile ? '300px' : '400px',
            maxHeight: isMobile ? '400px' : '500px',
            overflowY: 'auto',
        },
        statusHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? '12px' : '16px',
        },
        statusTitle: {
            fontSize: isMobile ? '1rem' : '1.125rem',
            fontWeight: 'bold',
        },
        statusChip: {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            height: isMobile ? '24px' : '28px',
        },
        listItem: {
            borderLeft: '4px solid',
            marginBottom: isMobile ? '8px' : '12px',
            borderRadius: 1,
            backgroundColor: 'background.default',
            padding: isMobile ? '8px' : '12px',
        },
        listItemText: {
            '& .MuiListItemText-primary': {
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: 'medium',
                lineHeight: 1.3,
            },
            '& .MuiListItemText-secondary': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
            },
        },
        pointsChip: {
            marginTop: isMobile ? '4px' : '8px',
            fontSize: isMobile ? '0.625rem' : '0.75rem',
            height: isMobile ? '20px' : '24px',
        },
        emptyState: {
            padding: isMobile ? '32px 16px' : '48px 24px',
            textAlign: 'center',
            color: 'textSecondary',
        },
        linearProgress: {
            height: isMobile ? '8px' : '10px',
            borderRadius: 5,
            marginBottom: isMobile ? '12px' : '16px',
        },
        dateContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
        },
        goalContainer: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: isMobile ? '8px' : '12px',
        },
        goalIcon: {
            marginRight: isMobile ? '8px' : '12px',
            fontSize: isMobile ? '20px' : '24px',
        },
    };

    if (loading) return <Loader />;
    if (!sprint) return <Typography>Sprint not found</Typography>;

    const canEditSprint = ['ADMIN', 'MANAGER'].includes(user?.role);

    return (
        <Box style={responsiveStyles.mainContainer}>
            {/* Sprint Header */}
            <Box style={{ marginBottom: isMobile ? '20px' : '32px' }}>
                <Box style={responsiveStyles.headerContainer}>
                    <Box style={{ width: isMobile ? '100%' : 'auto' }}>
                        <Typography variant="h3" fontWeight="bold" style={responsiveStyles.heading}>
                            {sprint.name}
                        </Typography>
                        <Typography variant="h6" color="textSecondary" style={responsiveStyles.subHeading}>
                            Sprint Board
                        </Typography>
                    </Box>
                    {canEditSprint && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenModal(true)}
                            style={responsiveStyles.button}
                        >
                            Edit Sprint
                        </Button>
                    )}
                </Box>

                {/* Sprint Goal */}
                {sprint.goal && (
                    <Paper style={responsiveStyles.goalPaper}>
                        <Box style={responsiveStyles.goalContainer}>
                            <GoalIcon style={responsiveStyles.goalIcon} />
                            <Typography variant="h6" fontWeight="bold">
                                Sprint Goal
                            </Typography>
                        </Box>
                        <Typography style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                            {sprint.goal}
                        </Typography>
                    </Paper>
                )}

                {/* Sprint Progress */}
                <Paper style={responsiveStyles.progressPaper}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Sprint Progress</Typography>
                        <Chip
                            label={`${issues.length} tasks`}
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={calculateProgress()}
                        style={responsiveStyles.linearProgress}
                    />
                    <Box style={responsiveStyles.dateContainer}>
                        <Typography variant="body2" color="textSecondary">
                            {new Date(sprint.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {new Date(sprint.end_date).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* Tasks by Status */}
            <Grid container style={responsiveStyles.gridContainer}>
                {['TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                    <Grid item xs={12} md={3} key={status} style={responsiveStyles.gridItem}>
                        <Paper style={responsiveStyles.statusPaper}>
                            <Box style={responsiveStyles.statusHeader}>
                                <Typography variant="h6" fontWeight="bold" style={responsiveStyles.statusTitle}>
                                    {status.replace('_', ' ')}
                                </Typography>
                                <Chip
                                    label={getStatusCount(status)}
                                    size="small"
                                    style={responsiveStyles.statusChip}
                                />
                            </Box>
                            <List style={{ padding: 0 }}>
                                {issues
                                    .filter(issue => issue.status === status)
                                    .map((issue) => (
                                        <React.Fragment key={issue.id}>
                                            <ListItem
                                                style={{
                                                    ...responsiveStyles.listItem,
                                                    borderColor:
                                                        issue.priority === 'HIGH' ? '#FF5630' :
                                                            issue.priority === 'MEDIUM' ? '#FFAB00' :
                                                                issue.priority === 'LOW' ? '#36B37E' : '#0052CC',
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography fontWeight="medium" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                                                            {issue.issue_key}: {issue.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="textSecondary" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                                                                Assignee: {issue.assignee || 'Unassigned'}
                                                            </Typography>
                                                            {issue.story_points && (
                                                                <Chip
                                                                    label={`${issue.story_points} pts`}
                                                                    size="small"
                                                                    style={responsiveStyles.pointsChip}
                                                                />
                                                            )}
                                                        </>
                                                    }
                                                    style={responsiveStyles.listItemText}
                                                />
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                            </List>
                            {getStatusCount(status) === 0 && (
                                <Box style={responsiveStyles.emptyState}>
                                    <Typography color="textSecondary">
                                        No tasks
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <SprintModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                projectId={sprint.project}
                sprintId={id}
                onSuccess={fetchSprintData}
            />
        </Box>
    );
};

export default SprintBoard;