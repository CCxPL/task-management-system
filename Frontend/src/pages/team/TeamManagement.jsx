import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getRoleDisplayName } from '../../utils/roleHelpers.js';

const TeamManagement = () => {
    const { user } = useSelector((state) => state.auth);
    const orgType = user?.organization?.type || 'COMPANY';

    const [openDialog, setOpenDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - will be replaced with API
    const mockTeam = orgType === 'INSTITUTE'
        ? [
            { id: 1, name: 'John Doe', email: 'john@university.edu', role: 'STUDENT', status: 'ACTIVE' },
            { id: 2, name: 'Sarah Smith', email: 'sarah@university.edu', role: 'STUDENT', status: 'ACTIVE' },
            { id: 3, name: 'Mike Johnson', email: 'mike@university.edu', role: 'TEACHER', status: 'ACTIVE' },
        ]
        : [
            { id: 1, name: 'Alice Brown', email: 'alice@company.com', role: 'MANAGER', status: 'ACTIVE' },
            { id: 2, name: 'Bob Wilson', email: 'bob@company.com', role: 'MEMBER', status: 'ACTIVE' },
            { id: 3, name: 'Charlie Davis', email: 'charlie@company.com', role: 'MEMBER', status: 'INACTIVE' },
        ];

    const filteredTeam = mockTeam.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const teamLabel = orgType === 'INSTITUTE' ? 'Students' : 'Team Members';
    const memberLabel = orgType === 'INSTITUTE' ? 'Student' : 'Member';

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        {teamLabel} Management
                    </Typography>
                    <Typography color="textSecondary">
                        {user?.organization?.name}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add {memberLabel}
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder={`Search ${teamLabel.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTeam.map((member) => (
                                    <TableRow key={member.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="medium">{member.name}</Typography>
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getRoleDisplayName(member.role, orgType)}
                                                size="small"
                                                color={member.role === 'MANAGER' || member.role === 'TEACHER' ? 'primary' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.status}
                                                color={member.status === 'ACTIVE' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {/* Add Member Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New {memberLabel}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Name" required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Email" type="email" required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Role"
                                select
                                SelectProps={{ native: true }}
                                required
                            >
                                {orgType === 'INSTITUTE' ? (
                                    <>
                                        <option value="TEACHER">Teacher</option>
                                        <option value="STUDENT">Student</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="MANAGER">Manager</option>
                                        <option value="MEMBER">Member</option>
                                    </>
                                )}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained">Add {memberLabel}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeamManagement;