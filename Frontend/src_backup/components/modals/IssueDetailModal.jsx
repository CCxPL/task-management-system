import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    TextField,
    Avatar,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    useTheme,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Delete as DeleteIcon,
    Comment as CommentIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const IssueDetailModal = ({ open, onClose, issue, onUpdate }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { user } = useSelector((state) => state.auth);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        if (issue?.id && open) {
            fetchComments();
        }
    }, [issue?.id, open]);

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const response = await fetch(
                `http://localhost:8000/api/issues/${issue.id}/comments/`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            const data = await response.json();
            console.log('✅ Comments loaded:', data);
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('❌ Failed to fetch comments:', error);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8000/api/issues/${issue.id}/comments/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: newComment
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to add comment');

            const data = await response.json();
            console.log('✅ Comment added:', data);
            
            setNewComment('');
            fetchComments();
            
            // Update parent to refresh comment count
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('❌ Failed to add comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            const response = await fetch(
                `http://localhost:8000/api/issues/${issue.id}/comments/${commentId}/`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to delete comment');

            console.log('✅ Comment deleted');
            fetchComments();
            
            // Update parent to refresh comment count
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('❌ Failed to delete comment:', error);
        }
    };

    if (!issue) return null;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'LOW': return 'success';
            case 'MEDIUM': return 'info';
            case 'HIGH': return 'warning';
            case 'CRITICAL': return 'error';
            default: return 'default';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    maxHeight: '90vh',
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    borderBottom: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                    pb: 2,
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                        <Typography 
                            variant="body2" 
                            color="primary" 
                            fontWeight="700" 
                            sx={{ letterSpacing: 0.5, mb: 0.5 }}
                        >
                            {issue.issue_key}
                        </Typography>
                        <Typography variant="h6" fontWeight="600">
                            {issue.title}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{ mt: -1 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Issue Metadata */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip 
                            label={issue.priority} 
                            color={getPriorityColor(issue.priority)} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                            label={issue.issue_type} 
                            variant="outlined" 
                            size="small" 
                        />
                        {issue.story_points && (
                            <Chip
                                label={`${issue.story_points} Story Points`}
                                color="info"
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {issue.assignee && (
                            <Chip
                                avatar={
                                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                                        {issue.assignee.charAt(0).toUpperCase()}
                                    </Avatar>
                                }
                                label={`Assigned to ${issue.assignee}`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                        {issue.due_date && (
                            <Chip
                                label={`Due ${new Date(issue.due_date).toLocaleDateString()}`}
                                size="small"
                                variant="outlined"
                                color="warning"
                            />
                        )}
                    </Box>

                    {issue.description && (
                        <Box>
                            <Typography 
                                variant="subtitle2" 
                                fontWeight="600" 
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <EditIcon fontSize="small" />
                                Description
                            </Typography>
                            <Paper 
                                sx={{ 
                                    p: 2, 
                                    bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                    borderRadius: '8px',
                                }}
                            >
                                <Typography variant="body2" color="textSecondary">
                                    {issue.description}
                                </Typography>
                            </Paper>
                        </Box>
                    )}
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Comments Section */}
                <Box>
                    <Typography 
                        variant="h6" 
                        fontWeight="600" 
                        gutterBottom 
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        <CommentIcon color="primary" />
                        Activity ({comments.length})
                    </Typography>

                    {/* Comments List */}
                    {loadingComments ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <Stack 
                            spacing={2} 
                            sx={{ 
                                mb: 3, 
                                maxHeight: 300, 
                                overflow: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    width: 6,
                                },
                                '&::-webkit-scrollbar-track': {
                                    bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                    borderRadius: 3,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: isDarkMode ? '#3D444D' : '#DFE1E6',
                                    borderRadius: 3,
                                },
                            }}
                        >
                            {comments.length === 0 ? (
                                <Paper 
                                    sx={{ 
                                        p: 4, 
                                        textAlign: 'center', 
                                        bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                        borderRadius: '12px',
                                    }}
                                >
                                    <CommentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography variant="body2" color="textSecondary">
                                        No comments yet. Be the first to comment!
                                    </Typography>
                                </Paper>
                            ) : (
                                comments.map((comment) => (
                                    <Paper
                                        key={comment.id}
                                        sx={{
                                            p: 2,
                                            bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                                            borderRadius: '12px',
                                            border: `1px solid ${isDarkMode ? '#3D444D' : 'transparent'}`,
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar 
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        bgcolor: 'primary.main',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {comment.user?.username || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(comment.created_at).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {comment.user?.id === user?.id && (
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    sx={{ 
                                                        color: 'error.main',
                                                        '&:hover': { bgcolor: 'error.main', color: 'white' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ pl: 5 }}>
                                            {comment.text}
                                        </Typography>
                                    </Paper>
                                ))
                            )}
                        </Stack>
                    )}

                    {/* Add Comment */}
                    <Box display="flex" gap={1.5} alignItems="flex-start">
                        <Avatar 
                            sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: 'primary.main',
                                mt: 0.5,
                            }}
                        >
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <TextField
                            fullWidth
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment();
                                }
                            }}
                            multiline
                            maxRows={4}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: isDarkMode ? '#22272B' : '#FFFFFF',
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim() || loading}
                                            color="primary"
                                            sx={{
                                                '&:disabled': {
                                                    opacity: 0.5,
                                                }
                                            }}
                                        >
                                            {loading ? <CircularProgress size={20} /> : <SendIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', pl: 6 }}>
                        Press Enter to send, Shift+Enter for new line
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions 
                sx={{ 
                    px: 3, 
                    py: 2, 
                    borderTop: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}` 
                }}
            >
                <Button 
                    onClick={onClose}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IssueDetailModal;