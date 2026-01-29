import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    MenuItem,
    Grid,
    Alert,
    useTheme,
    CircularProgress,
    Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createIssue, updateIssue } from '../../app/slices/issueSlice';
import { teamAPI } from '../../api/team.api';
import { sprintsAPI } from '../../api/sprints.api';

const IssueModal = ({ open, onClose, issue, onSuccess }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const { currentProject } = useSelector((state) => state.projectContext);
    const isEditMode = !!issue;

    // ✅ State for team members and sprints
    const [teamMembers, setTeamMembers] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        issue_type: 'TASK',
        priority: 'MEDIUM',
        status: 'TO_DO',
        assignee: '',  // ✅ User ID
        sprint: '',    // ✅ Sprint ID
        story_points: '',
        due_date: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ✅ Fetch team members and sprints when modal opens
    useEffect(() => {
        if (open && currentProject?.id) {
            fetchModalData();
        }
    }, [open, currentProject?.id]);

    // ✅ Pre-fill form when editing
    useEffect(() => {
        if (issue && open) {
            console.log('✏️ Edit mode - Loading issue:', issue);
            setFormData({
                title: issue.title || '',
                description: issue.description || '',
                issue_type: issue.issue_type || 'TASK',
                priority: issue.priority || 'MEDIUM',
                status: issue.status || 'TO_DO',
                assignee: issue.assignee?.id || issue.assignee || '',
                sprint: issue.sprint?.id || issue.sprint || '',
                story_points: issue.story_points || '',
                due_date: issue.due_date ? new Date(issue.due_date) : null,
            });
        } else {
            // Reset form for new issue
            setFormData({
                title: '',
                description: '',
                issue_type: 'TASK',
                priority: 'MEDIUM',
                status: 'TO_DO',
                assignee: '',
                sprint: '',
                story_points: '',
                due_date: null,
            });
        }
        setError('');
    }, [issue, open]);

    // ✅ Fetch team members and sprints
    const fetchModalData = async () => {
        try {
            setLoadingData(true);
            console.log('📥 Fetching team members and sprints...');

            // Fetch team members
            const membersData = await teamAPI.getTeamMembers();
            console.log('✅ Team members:', membersData);
            setTeamMembers(Array.isArray(membersData) ? membersData : []);

            // Fetch sprints
            const sprintsData = await sprintsAPI.getSprintsByProject(currentProject.id);
            console.log('✅ Sprints:', sprintsData);
            setSprints(Array.isArray(sprintsData) ? sprintsData : []);

        } catch (error) {
            console.error('❌ Failed to fetch modal data:', error);
            setTeamMembers([]);
            setSprints([]);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            due_date: date,
        });
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // ✅ Validate required fields
        if (!formData.title?.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }

        if (!currentProject?.id) {
            setError('No project selected');
            setLoading(false);
            return;
        }

        const issueData = {
            title: formData.title.trim(),
            description: formData.description?.trim() || '',
            project: parseInt(currentProject.id),
            issue_type: formData.issue_type || 'TASK',
            priority: formData.priority || 'MEDIUM',
            // ❌ REMOVE status - backend doesn't accept it on create
            // status: formData.status || 'TO_DO',
            
            // ✅ Convert to integers or null
            assignee: formData.assignee ? parseInt(formData.assignee) : null,
            sprint: formData.sprint ? parseInt(formData.sprint) : null,
            story_points: formData.story_points ? parseInt(formData.story_points) : null,
            due_date: formData.due_date 
                ? formData.due_date.toISOString().split('T')[0] 
                : null,
        };

        console.log('📤 Submitting issue:', issueData);

        if (isEditMode) {
            // ✅ For update, include status
            await dispatch(updateIssue({ 
                issueId: issue.id, 
                issueData: {
                    ...issueData,
                    status: formData.status, // ✅ Include status for update
                }
            })).unwrap();
            console.log('✅ Issue updated');
        } else {
            // ✅ For create, don't include status
            await dispatch(createIssue(issueData)).unwrap();
            console.log('✅ Issue created');
        }

        // Reset form
        setFormData({
            title: '',
            description: '',
            issue_type: 'TASK',
            priority: 'MEDIUM',
            status: 'TO_DO',
            assignee: '',
            sprint: '',
            story_points: '',
            due_date: null,
        });

        if (onSuccess) {
            onSuccess();
        }

        onClose();
    } catch (err) {
        console.error('❌ Failed to save issue:', err);
        
        // ✅ Extract detailed error message
        let errorMessage = 'Failed to save issue';
        
        if (err?.response?.data) {
            const errorData = err.response.data;
            
            // Check for field-specific errors
            if (typeof errorData === 'object') {
                const errors = [];
                Object.keys(errorData).forEach(key => {
                    if (Array.isArray(errorData[key])) {
                        errors.push(`${key}: ${errorData[key].join(', ')}`);
                    } else {
                        errors.push(`${key}: ${errorData[key]}`);
                    }
                });
                errorMessage = errors.join(' | ');
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (err?.message) {
            errorMessage = err.message;
        }
        
        console.error('Error message:', errorMessage);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            issue_type: 'TASK',
            priority: 'MEDIUM',
            status: 'TO_DO',
            assignee: '',
            sprint: '',
            story_points: '',
            due_date: null,
        });
        setError('');
        onClose();
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
                    }
                }}
            >
                <DialogTitle>
                    {isEditMode ? `Edit Issue: ${issue?.issue_key}` : 'Create New Issue'}
                </DialogTitle>
                
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                                {error}
                            </Alert>
                        )}

                        {/* ✅ Loading state for dropdowns */}
                        {loadingData && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                                <Typography sx={{ ml: 2 }}>Loading team members and sprints...</Typography>
                            </Box>
                        )}

                        <Grid container spacing={2}>
                            {/* Title */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                />
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    margin="normal"
                                />
                            </Grid>

                            {/* Issue Type */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Issue Type"
                                    name="issue_type"
                                    value={formData.issue_type}
                                    onChange={handleChange}
                                    margin="normal"
                                >
                                    <MenuItem value="STORY">Story</MenuItem>
                                    <MenuItem value="TASK">Task</MenuItem>
                                    <MenuItem value="BUG">Bug</MenuItem>
                                    <MenuItem value="EPIC">Epic</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Priority */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    margin="normal"
                                >
                                    <MenuItem value="CRITICAL">Critical</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="LOW">Low</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Status */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    margin="normal"
                                >
                                    <MenuItem value="TO_DO">To Do</MenuItem>
                                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                    <MenuItem value="REVIEW">Review</MenuItem>
                                    <MenuItem value="DONE">Done</MenuItem>
                                </TextField>
                            </Grid>

                            {/* ✅ ASSIGNEE DROPDOWN */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Assignee"
                                    name="assignee"
                                    value={formData.assignee}
                                    onChange={handleChange}
                                    margin="normal"
                                    disabled={loadingData}
                                >
                                    <MenuItem value="">
                                        <em>Unassigned</em>
                                    </MenuItem>
                                    {teamMembers.map((member) => (
                                        <MenuItem key={member.user_id || member.id} value={member.user_id || member.id}>
                                            {member.name || member.username} ({member.email})
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {teamMembers.length === 0 && !loadingData && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                        No team members found. Add members to the project first.
                                    </Typography>
                                )}
                            </Grid>

                            {/* ✅ SPRINT DROPDOWN */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Sprint"
                                    name="sprint"
                                    value={formData.sprint}
                                    onChange={handleChange}
                                    margin="normal"
                                    disabled={loadingData}
                                >
                                    <MenuItem value="">
                                        <em>Backlog (No Sprint)</em>
                                    </MenuItem>
                                    {sprints.map((sprint) => (
                                        <MenuItem key={sprint.id} value={sprint.id}>
                                            {sprint.name} ({sprint.status})
                                        </MenuItem>
                                    ))}
                                </TextField>
                                {sprints.length === 0 && !loadingData && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                        No sprints available. Create a sprint first.
                                    </Typography>
                                )}
                            </Grid>

                            {/* Story Points */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Story Points"
                                    name="story_points"
                                    type="number"
                                    value={formData.story_points}
                                    onChange={handleChange}
                                    margin="normal"
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            {/* Due Date */}
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Due Date"
                                    value={formData.due_date}
                                    onChange={handleDateChange}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth margin="normal" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    
                    <DialogActions sx={{ p: 2 }}>
                        <Button 
                            onClick={handleClose} 
                            disabled={loading}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || loadingData}
                            sx={{ 
                                borderRadius: '8px', 
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                            }}
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Issue' : 'Create Issue'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default IssueModal;