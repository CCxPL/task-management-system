import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    useTheme,
} from '@mui/material';
import {
    DragIndicator as DragIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Comment as CommentIcon,
} from '@mui/icons-material';

const IssueCard = ({ id, issue, priorityColor, onClick }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                // Only trigger onClick if not dragging
                if (!isDragging && onClick) {
                    onClick(issue);
                }
            }}
            sx={{
                p: 2,
                mb: 1.5,
                borderRadius: '12px',
                bgcolor: isDarkMode ? '#22272B' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: 3,
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
            }}
        >
            <Box display="flex" alignItems="flex-start" gap={1}>
                <IconButton
                    size="small"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()} // Prevent card click when dragging
                    sx={{ cursor: 'grab', mt: -0.5, '&:active': { cursor: 'grabbing' } }}
                >
                    <DragIcon fontSize="small" />
                </IconButton>

                <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography 
                            variant="caption" 
                            fontWeight="700" 
                            color="primary"
                            sx={{ letterSpacing: 0.5 }}
                        >
                            {issue.issue_key}
                        </Typography>
                        <Chip
                            label={issue.priority}
                            size="small"
                            color={priorityColor}
                            sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                fontWeight: 600,
                            }}
                        />
                    </Box>

                    <Typography 
                        variant="body2" 
                        fontWeight="500" 
                        gutterBottom
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {issue.title}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            {/* Issue Type Chip */}
                            <Chip
                                label={issue.issue_type}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                    height: 20, 
                                    fontSize: '0.65rem',
                                    borderRadius: '6px',
                                }}
                            />

                            {/* Story Points */}
                            {issue.story_points && (
                                <Chip
                                    label={`${issue.story_points} pts`}
                                    size="small"
                                    color="info"
                                    sx={{ 
                                        height: 20, 
                                        fontSize: '0.65rem',
                                    }}
                                />
                            )}

                            {/* Comment Count */}
                            {issue.comments_count > 0 && (
                                <Tooltip title={`${issue.comments_count} comments`}>
                                    <Box 
                                        display="flex" 
                                        alignItems="center" 
                                        gap={0.3}
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        <CommentIcon sx={{ fontSize: 12 }} />
                                        <Typography variant="caption">
                                            {issue.comments_count}
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            )}
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            {/* Due Date */}
                            {issue.due_date && (
                                <Tooltip title={`Due: ${new Date(issue.due_date).toLocaleDateString()}`}>
                                    <Box display="flex" alignItems="center" gap={0.3}>
                                        <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="textSecondary" fontSize="0.7rem">
                                            {new Date(issue.due_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                </Tooltip>
                            )}

                            {/* Assignee Avatar */}
                           {/* Assignee Avatar */}
                            {issue.assignee && (
                            <Tooltip
                                title={`Assignee: ${
                                issue.assignee.name ||
                                issue.assignee.username ||
                                issue.assignee.email ||
                                'Unassigned'
                                }`}
                            >
                                <Avatar
                                sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.75rem',
                                }}
                                >
                                {(
                                    issue.assignee.name ||
                                    issue.assignee.username ||
                                    issue.assignee.email ||
                                    'U'
                                )[0].toUpperCase()}
                                </Avatar>
                            </Tooltip>
                            )}

                        </Box>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default IssueCard;