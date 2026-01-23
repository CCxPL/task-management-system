import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sprintsAPI } from '../../api/sprints.api';

const SprintModal = ({ open, onClose, projectId }) => {
    const dispatch = useDispatch();
    const { list: sprints } = useSelector((state) => state.sprints || { list: [] });
    const [formData, setFormData] = useState({
        project: projectId,
        name: '',
        goal: '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if project already has an active sprint
    const hasActiveSprint = sprints.some(
        sprint => sprint.project === projectId && sprint.status === 'ACTIVE'
    );

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDateChange = (name, date) => {
        setFormData({
            ...formData,
            [name]: date,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (hasActiveSprint) {
            setError('This project already has an active sprint. Only one active sprint allowed per project.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await sprintsAPI.createSprint({
                ...formData,
                start_date: formData.start_date.toISOString().split('T')[0],
                end_date: formData.end_date.toISOString().split('T')[0],
            });

            onClose();
            setFormData({
                project: projectId,
                name: '',
                goal: '',
                start_date: new Date(),
                end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            });
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to create sprint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Create New Sprint</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {hasActiveSprint && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                This project already has an active sprint. You can only have one active sprint per project.
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Sprint Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                    helperText="e.g., Sprint 1, January Iteration"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Sprint Goal"
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                    margin="normal"
                                    helperText="What do you want to achieve in this sprint?"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Start Date"
                                    value={formData.start_date}
                                    onChange={(date) => handleDateChange('start_date', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="End Date"
                                    value={formData.end_date}
                                    onChange={(date) => handleDateChange('end_date', date)}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading || hasActiveSprint}
                        >
                            {loading ? 'Creating...' : 'Create Sprint'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default SprintModal;