import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiFetch } from '../../utils/apiHelper';
import {
    Box,
    Paper,
    Typography,
    Button,
    Chip,
    Avatar,
    TextField,
    Divider,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccessTime as TimeIcon,
    Comment as CommentIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { issuesAPI } from '../../api/issues.api.js';
import { timelogsAPI } from '../../api/timelogs.api.js';
import Loader from '../../components/common/Loader.jsx';
import TimeLogModal from '../../components/modals/TimeLogModal.jsx';

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [timelogs, setTimelogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [status, setStatus] = useState('');
    const [openTimeLogModal, setOpenTimeLogModal] = useState(false);
    

    useEffect(() => {
        fetchIssueDetails();
    }, [id]);

    const fetchIssueDetails = async () => {
        try {
            setLoading(true);
            const [issueData, commentsData, timelogsData] = await Promise.all([
                issuesAPI.getIssueById(id),
                issuesAPI.getComments(id),
                timelogsAPI.getTimelogsByIssue(id),
            ]);
            setIssue(issueData);
            setComments(commentsData);
            setTimelogs(timelogsData);
            setStatus(issueData.status);
        } catch (error) {
            console.error('Error fetching issue details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await issuesAPI.updateIssueStatus(id, newStatus);
            setStatus(newStatus);
            if (issue) {
                setIssue({ ...issue, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            await issuesAPI.addComment(id, commentText);
            setCommentText('');
            fetchIssueDetails(); // Refresh comments
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'LOW': return 'success';
            case 'MEDIUM': return 'info';
            case 'HIGH': return 'warning';
            case 'CRITICAL': return 'error';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'BUG': return 'error';
            case 'TASK': return 'primary';
            case 'STORY': return 'success';
            default: return 'default';
        }
    };

    if (loading) return <Loader />;
    if (!issue) return <Typography>Issue not found</Typography>;

    return (
        <Box>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <BackIcon />
                </IconButton>
                <Box flex={1}>
                    <Typography variant="h4" fontWeight="bold">
                        {issue.issue_key}: {issue.title}
                    </Typography>
                    <Box display="flex" gap={1} mt={1}>
                        <Chip label={issue.issue_type} color={getTypeColor(issue.issue_type)} />
                        <Chip label={issue.priority} color={getPriorityColor(issue.priority)} />
                        <Chip label={issue.status} variant="outlined" />
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<TimeIcon />}
                    onClick={() => setOpenTimeLogModal(true)}
                >
                    Log Time
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Details */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Description
                        </Typography>
                        <Typography color="textSecondary" paragraph>
                            {issue.description || 'No description provided.'}
                        </Typography>
                    </Paper>

                    {/* Comments Section */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Comments ({comments.length})
                        </Typography>

                        {/* Add Comment */}
                        <Box mb={3}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                variant="outlined"
                            />
                            <Box display="flex" justifyContent="flex-end" mt={1}>
                                <Button
                                    variant="contained"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                >
                                    Add Comment
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Comments List */}
                        <List>
                            {comments.map((comment) => (
                                <React.Fragment key={comment.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar>{comment.user?.charAt(0) || 'U'}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography fontWeight="bold">
                                                        {comment.user}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography color="textSecondary">
                                                    {comment.comment}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Right Column - Sidebar */}
                <Grid item xs={12} md={4}>
                    {/* Status Update */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Update Status
                        </Typography>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                label="Status"
                            >
                                {['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((s) => (
                                    <MenuItem key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Paper>

                    {/* Details */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Details
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    Reporter
                                </Typography>
                                <Typography>{issue.reporter || 'Unknown'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    Assignee
                                </Typography>
                                <Typography>{issue.assignee || 'Unassigned'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    Created
                                </Typography>
                                <Typography>
                                    {new Date(issue.created_at).toLocaleDateString()}
                                </Typography>
                            </Box>
                            {issue.due_date && (
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Due Date
                                    </Typography>
                                    <Typography>
                                        {new Date(issue.due_date).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            )}
                            {issue.story_points && (
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Story Points
                                    </Typography>
                                    <Typography>{issue.story_points}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    {/* Time Logs */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Time Logs ({timelogs.length})
                        </Typography>
                        <List dense>
                            {timelogs.map((log) => (
                                <ListItem key={log.id}>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2">
                                                    {log.date}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {log.hours_spent} hours
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={log.description}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        {timelogs.length === 0 && (
                            <Typography color="textSecondary" textAlign="center" py={2}>
                                No time logged yet
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <TimeLogModal
                open={openTimeLogModal}
                onClose={() => setOpenTimeLogModal(false)}
                issueId={id}
                onSuccess={fetchIssueDetails}
            />
        </Box>
    );
};

export default IssueDetail;