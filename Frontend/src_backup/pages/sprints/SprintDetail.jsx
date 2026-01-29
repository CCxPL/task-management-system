import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    AvatarGroup,
    Chip,
    LinearProgress,
    Divider,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    useTheme,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Edit as EditIcon,
    CalendarToday as CalendarIcon,
    Flag as GoalIcon,
    Assignment as TaskIcon,
    People as PeopleIcon,
    TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { sprintsAPI } from '../../api/sprints.api';
import { issuesAPI } from '../../api/issues.api';
import { teamAPI } from '../../api/team.api';
import SprintModal from '../../components/modals/SprintModal';
import Loader from '../../components/common/Loader';

const SprintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const { user } = useSelector((state) => state.auth);
    const canEdit = ['ADMIN', 'MANAGER'].includes(user?.role);

    const [sprint, setSprint] = useState(null);
    const [issues, setIssues] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openEditModal, setOpenEditModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSprintDetails();
        }
    }, [id]);

    const fetchSprintDetails = async () => {
        try {
            setLoading(true);

            // Fetch sprint
            const sprintData = await sprintsAPI.getSprintById(id);
            setSprint(sprintData);

            // Fetch issues for this sprint
            const allIssues = await issuesAPI.getIssues(sprintData.project);
            const sprintIssues = Array.isArray(allIssues) 
                ? allIssues.filter(issue => issue.sprint === parseInt(id))
                : [];
            setIssues(sprintIssues);

            // Fetch team members
            const members = await teamAPI.getTeamMembers();
            setTeamMembers(Array.isArray(members) ? members : []);

        } catch (error) {
            console.error('❌ Failed to fetch sprint details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!sprint) return <Typography>Sprint not found</Typography>;

    // ✅ Calculate statistics
    const stats = {
        total: issues.length,
        todo: issues.filter(i => i.status === 'TO_DO').length,
        inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
        review: issues.filter(i => i.status === 'REVIEW').length,
        done: issues.filter(i => i.status === 'DONE').length,
    };

    const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

    // ✅ Get unique assignees
    const assignedMembers = teamMembers.filter(member =>
        issues.some(issue => issue.assignee?.id === member.user_id || issue.assignee === member.user_id)
    );

    // ✅ Sprint duration
    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const today = new Date();
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/sprints')} sx={{ bgcolor: isDarkMode ? '#22272B' : '#F4F5F7' }}>
                        <BackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="700">
                            {sprint.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Sprint Details & Analytics
                        </Typography>
                    </Box>
                </Box>
                {canEdit && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setOpenEditModal(true)}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        }}
                    >
                        Edit Sprint
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Status Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ProgressIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="600">
                                    Sprint Status
                                </Typography>
                            </Box>
                            <Chip
                                label={sprint.status}
                                color={
                                    sprint.status === 'ACTIVE' ? 'success' :
                                    sprint.status === 'PLANNED' ? 'warning' :
                                    sprint.status === 'COMPLETED' ? 'default' : 'info'
                                }
                                sx={{ mb: 2 }}
                            />
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                {Math.round(progress)}% Complete ({stats.done}/{stats.total} tasks)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Timeline Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="600">
                                    Timeline
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Start: {startDate.toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    End: {endDate.toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" fontWeight="600">
                                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Sprint ended'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {daysElapsed}/{totalDays} days elapsed
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Team Members Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="600">
                                    Team Members
                                </Typography>
                            </Box>
                            {assignedMembers.length > 0 ? (
                                <>
                                    <AvatarGroup max={4} sx={{ mb: 2, justifyContent: 'flex-start' }}>
                                        {assignedMembers.map((member) => (
                                            <Avatar
                                                key={member.id}
                                                sx={{ bgcolor: 'primary.main' }}
                                                title={member.name || member.username}
                                            >
                                                {(member.name || member.username)?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        ))}
                                    </AvatarGroup>
                                    <Typography variant="body2" color="textSecondary">
                                        {assignedMembers.length} member{assignedMembers.length !== 1 ? 's' : ''} assigned
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No members assigned yet
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sprint Goal */}
                {sprint.goal && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: 'primary.light', color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <GoalIcon sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight="600">
                                    Sprint Goal
                                </Typography>
                            </Box>
                            <Typography>{sprint.goal}</Typography>
                        </Paper>
                    </Grid>
                )}

                {/* Task Breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TaskIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight="600">
                                Task Breakdown
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F0F8FF' }}>
                                    <Typography variant="h4" fontWeight="700" color="primary">
                                        {stats.todo}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        To Do
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF4E6' }}>
                                    <Typography variant="h4" fontWeight="700" color="warning.main">
                                        {stats.inProgress}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        In Progress
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
                                    <Typography variant="h4" fontWeight="700" color="info.main">
                                        {stats.review}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Review
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
                                    <Typography variant="h4" fontWeight="700" color="success.main">
                                        {stats.done}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Done
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Issues List */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '16px', maxHeight: '400px', overflow: 'auto' }}>
                        <Typography variant="h6" fontWeight="600" mb={2}>
                            Sprint Issues ({issues.length})
                        </Typography>
                        {issues.length > 0 ? (
                            <List>
                                {issues.map((issue) => (
                                    <ListItem
                                        key={issue.id}
                                        sx={{
                                            borderLeft: `4px solid ${
                                                issue.priority === 'CRITICAL' ? '#D32F2F' :
                                                issue.priority === 'HIGH' ? '#FF5630' :
                                                issue.priority === 'MEDIUM' ? '#FFAB00' :
                                                '#36B37E'
                                            }`,
                                            mb: 1,
                                            borderRadius: '8px',
                                            bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography fontWeight="500">
                                                    {issue.issue_key}: {issue.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                    <Chip label={issue.status.replace('_', ' ')} size="small" />
                                                    <Chip label={issue.priority} size="small" color="warning" />
                                                    {issue.assignee && (
                                                        <Chip
                                                            label={issue.assignee.username || 'Assigned'}
                                                            size="small"
                                                            avatar={
                                                                <Avatar sx={{ width: 20, height: 20 }}>
                                                                    {issue.assignee.username?.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                            }
                                                        />
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="textSecondary" textAlign="center" py={3}>
                                No issues in this sprint yet
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Edit Modal */}
            <SprintModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                projectId={sprint.project}
                sprint={sprint}
                onSuccess={fetchSprintDetails}
            />
        </Box>
    );
};

export default SprintDetail;