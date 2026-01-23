import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Box,
    Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { issuesAPI } from '../../api/issues.api';
import { fetchIssues } from '../../app/slices/issueSlice';

// Mock data - in real app would come from API
const mockUsers = [
    { id: 1, name: 'Admin User', role: 'ADMIN' },
    { id: 2, name: 'Manager User', role: 'MANAGER' },
    { id: 3, name: 'Developer One', role: 'MEMBER' },
    { id: 4, name: 'Developer Two', role: 'MEMBER' },
];

const mockSprints = [
    { id: 1, name: 'Sprint 1', status: 'ACTIVE' },
    { id: 2, name: 'Sprint 2', status: 'PLANNED' },
];

const IssueModal = ({ open, onClose, projectId, issueId, onSuccess }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        project: projectId,
        sprint: '',
        title: '',
        description: '',
        issue_type: 'TASK',
        priority: 'MEDIUM',
        assignee: '',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        story_points: '',
    });
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (issueId) {
            setIsEditMode(true);
            fetchIssueData();
        } else {
            setIsEditMode(false);
            resetForm();
        }
    }, [issueId]);

    const fetchIssueData = async () => {
        try {
            const issue = await issuesAPI.getIssueById(issueId);
            setFormData({
                project: issue.project,
                sprint: issue.sprint || '',
                title: issue.title,
                description: issue.description || '',
                issue_type: issue.issue_type,
                priority: issue.priority,
                assignee: issue.assignee || '',
                due_date: issue.due_date ? new Date(issue.due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                story_points: issue.story_points || '',
            });
        } catch (error) {
            console.error('❌ Failed to fetch issue:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            project: projectId,
            sprint: '',
            title: '',
            description: '',
            issue_type: 'TASK',
            priority: 'MEDIUM',
            assignee: '',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            story_points: '',
        });
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

        try {
            const payload = {
                ...formData,
                due_date: formData.due_date.toISOString().split('T')[0],
                story_points: formData.story_points ? parseInt(formData.story_points) : null,
            };

            if (isEditMode) {
                console.log('📝 Updating issue:', issueId);
                await issuesAPI.updateIssue(issueId, payload);
                console.log('✅ Issue updated');
            } else {
                console.log('📝 Creating new issue:', payload);
                const result = await issuesAPI.createIssue(payload);
                console.log('✅ Issue created:', result.data);
            }

            // ✅ CRITICAL: Refresh kanban board
            console.log('🔄 Refreshing kanban board...');
            await dispatch(fetchIssues(projectId));
            console.log('✅ Kanban board refreshed');

            onClose();
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('❌ Failed to save issue:', error);
            console.error('❌ Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {isEditMode ? 'Edit Issue' : 'Create New Issue'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    placeholder="Brief description of the issue"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    margin="normal"
                                    placeholder="Detailed description of the issue..."
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Issue Type</InputLabel>
                                    <Select
                                        name="issue_type"
                                        value={formData.issue_type}
                                        onChange={handleChange}
                                        label="Issue Type"
                                    >
                                        <MenuItem value="TASK">
                                            <Chip label="Task" color="primary" size="small" /> Task
                                        </MenuItem>
                                        <MenuItem value="BUG">
                                            <Chip label="Bug" color="error" size="small" /> Bug
                                        </MenuItem>
                                        <MenuItem value="STORY">
                                            <Chip label="Story" color="success" size="small" /> Story
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        label="Priority"
                                    >
                                        <MenuItem value="LOW">
                                            <Chip label="Low" color="success" size="small" /> Low
                                        </MenuItem>
                                        <MenuItem value="MEDIUM">
                                            <Chip label="Medium" color="info" size="small" /> Medium
                                        </MenuItem>
                                        <MenuItem value="HIGH">
                                            <Chip label="High" color="warning" size="small" /> High
                                        </MenuItem>
                                        <MenuItem value="CRITICAL">
                                            <Chip label="Critical" color="error" size="small" /> Critical
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Assignee</InputLabel>
                                    <Select
                                        name="assignee"
                                        value={formData.assignee}
                                        onChange={handleChange}
                                        label="Assignee"
                                    >
                                        <MenuItem value="">Unassigned</MenuItem>
                                        {mockUsers.map((user) => (
                                            <MenuItem key={user.id} value={user.id}>
                                                {user.name} ({user.role})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Sprint</InputLabel>
                                    <Select
                                        name="sprint"
                                        value={formData.sprint}
                                        onChange={handleChange}
                                        label="Sprint"
                                    >
                                        <MenuItem value="">No Sprint</MenuItem>
                                        {mockSprints.map((sprint) => (
                                            <MenuItem key={sprint.id} value={sprint.id}>
                                                {sprint.name} ({sprint.status})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Story Points"
                                    name="story_points"
                                    value={formData.story_points}
                                    onChange={handleChange}
                                    margin="normal"
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    helperText="Estimation points (optional)"
                                />
                            </Grid>

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
                    <DialogActions>
                        <Button onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Saving...' : isEditMode ? 'Update Issue' : 'Create Issue'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default IssueModal;