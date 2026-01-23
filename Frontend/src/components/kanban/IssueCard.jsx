import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Avatar,
    AvatarGroup,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    DragIndicator as DragIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
} from '@mui/icons-material';

const IssueCard = ({ id, issue, priorityColor }) => {
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
        cursor: 'grab',
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            sx={{
                p: 2,
                '&:hover': { boxShadow: 3 },
            }}
        >
            <Box display="flex" alignItems="flex-start" gap={1}>
                <IconButton
                    size="small"
                    {...attributes}
                    {...listeners}
                    sx={{ cursor: 'grab', mt: -0.5 }}
                >
                    <DragIcon fontSize="small" />
                </IconButton>

                <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            {issue.issue_key}
                        </Typography>
                        <Chip
                            label={issue.priority}
                            size="small"
                            color={priorityColor}
                            variant="outlined"
                        />
                    </Box>

                    <Typography variant="body2" gutterBottom>
                        {issue.title}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            {issue.assignee && (
                                <Tooltip title={`Assignee: ${issue.assignee}`}>
                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                        <PersonIcon sx={{ fontSize: 14 }} />
                                    </Avatar>
                                </Tooltip>
                            )}

                            {issue.story_points && (
                                <Chip
                                    label={`${issue.story_points} pts`}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                        {issue.due_date && (
                            <Tooltip title={`Due: ${new Date(issue.due_date).toLocaleDateString()}`}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(issue.due_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default IssueCard;