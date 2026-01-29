import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { timelogsAPI } from '../../api/timelogs.api';

const TimeLogModal = ({ open, onClose, issueId, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: new Date(),
        hours_spent: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            date: date,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await timelogsAPI.createTimelog({
                issue: issueId,
                date: formData.date.toISOString().split('T')[0],
                hours_spent: parseFloat(formData.hours_spent),
                description: formData.description,
            });

            onClose();
            setFormData({
                date: new Date(),
                hours_spent: '',
                description: '',
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to log time');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Log Time</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Date"
                                    value={formData.date}
                                    onChange={handleDateChange}
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth margin="normal" required />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Hours Spent"
                                    name="hours_spent"
                                    type="number"
                                    value={formData.hours_spent}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                    inputProps={{ min: 0.5, max: 24, step: 0.5 }}
                                    helperText="Hours worked on this task"
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
                                    rows={3}
                                    margin="normal"
                                    required
                                    placeholder="What did you work on?"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Logging...' : 'Log Time'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default TimeLogModal;