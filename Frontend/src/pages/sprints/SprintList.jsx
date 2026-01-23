import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    IconButton,
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Grid,
    Stack,
} from '@mui/material';
import {
    Add as AddIcon,
    PlayArrow as ActiveIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { sprintsAPI } from '../../api/sprints.api.js';
import SprintModal from '../../components/modals/SprintModal.jsx';
import Loader from '../../components/common/Loader.jsx';

const SprintList = () => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const { user } = useSelector((state) => state.auth);

    // Responsive hooks
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    useEffect(() => {
        fetchSprints();
    }, []);

    const fetchSprints = async () => {
        try {
            setLoading(true);
            const data = await sprintsAPI.getSprintsByProject(null);
            setSprints(data);
        } catch (error) {
            console.error('Error fetching sprints:', error);
        } finally {
            setLoading(false);
        }
    };

    // API Contract: Role-based permissions
    const canCreateSprint = ['ADMIN', 'MANAGER'].includes(user?.role);

    if (loading) return <Loader />;

    // ========== MOBILE VIEW (Cards) ==========
    if (isMobile) {
        return (
            <Box sx={{ p: 2 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Sprints
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Manage and track all sprints
                    </Typography>
                </Box>

                {/* Create Sprint Button */}
                {canCreateSprint && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                        fullWidth
                        sx={{ mb: 3 }}
                    >
                        Create Sprint
                    </Button>
                )}

                {/* Mobile Cards View */}
                {sprints.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            No sprints found
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Create your first sprint to start tracking work
                        </Typography>
                        {canCreateSprint && (
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenModal(true)}
                            >
                                Create First Sprint
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        {sprints.map((sprint) => (
                            <Card key={sprint.id} variant="outlined">
                                <CardContent>
                                    {/* Sprint Name and Status */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="medium">
                                                {sprint.name}
                                            </Typography>
                                            {sprint.status === 'ACTIVE' && (
                                                <Chip
                                                    icon={<ActiveIcon />}
                                                    label="Active"
                                                    color="success"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mt: 1 }}
                                                />
                                            )}
                                        </Box>
                                        <Chip
                                            label={sprint.status}
                                            color={
                                                sprint.status === 'ACTIVE' ? 'success' :
                                                    sprint.status === 'PLANNED' ? 'warning' :
                                                        sprint.status === 'COMPLETED' ? 'default' : 'info'
                                            }
                                            size="small"
                                        />
                                    </Box>

                                    {/* Goal */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Goal:
                                        </Typography>
                                        <Typography variant="body2">
                                            {sprint.goal || 'No goal specified'}
                                        </Typography>
                                    </Box>

                                    {/* Duration */}
                                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ScheduleIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {new Date(sprint.start_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            {' - '}
                                            {new Date(sprint.end_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <IconButton
                                            color="primary"
                                            href={`/sprints/${sprint.id}`}
                                            title="View Sprint Board"
                                            size="small"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        {canCreateSprint && (
                                            <IconButton
                                                color="info"
                                                onClick={() => setOpenModal(true)}
                                                title="Edit Sprint"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* Sprint Modal */}
                <SprintModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={fetchSprints}
                />
            </Box>
        );
    }

    // ========== DESKTOP/TABLET VIEW (Table) ==========
    return (
        <Box style={{ padding: isTablet ? '16px' : '24px', width: '100%' }}>
            {/* Header */}
            <Box style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Sprints
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Manage and track all sprints
                    </Typography>
                </Box>

                {/* Create Sprint Button */}
                {canCreateSprint && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                    >
                        Create Sprint
                    </Button>
                )}
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: '200px' }}>
                                Sprint Name
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: '250px' }}>
                                Goal
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: '150px' }}>
                                Duration
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: '100px' }}>
                                Status
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: '120px', textAlign: 'center' }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sprints.map((sprint) => (
                            <TableRow
                                key={sprint.id}
                                hover
                                sx={{
                                    borderLeft: sprint.status === 'ACTIVE' ? '4px solid #36B37E' : 'none'
                                }}
                            >
                                {/* Sprint Name */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography fontWeight="medium">
                                            {sprint.name}
                                        </Typography>
                                        {sprint.status === 'ACTIVE' && (
                                            <Chip
                                                icon={<ActiveIcon />}
                                                label="Active"
                                                color="success"
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </TableCell>

                                {/* Sprint Goal */}
                                <TableCell>
                                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '240px' }}>
                                        {sprint.goal || 'No goal specified'}
                                    </Typography>
                                </TableCell>

                                {/* Duration */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ScheduleIcon fontSize="small" />
                                        <Typography variant="body2">
                                            {new Date(sprint.start_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            {' - '}
                                            {new Date(sprint.end_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Chip
                                        label={sprint.status}
                                        color={
                                            sprint.status === 'ACTIVE' ? 'success' :
                                                sprint.status === 'PLANNED' ? 'warning' :
                                                    sprint.status === 'COMPLETED' ? 'default' : 'info'
                                        }
                                        size="small"
                                    />
                                </TableCell>

                                {/* Action Buttons */}
                                <TableCell align="center">
                                    <Box display="flex" gap={1} justifyContent="center">
                                        <IconButton
                                            color="primary"
                                            href={`/sprints/${sprint.id}`}
                                            title="View Sprint Board"
                                            size="small"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        {canCreateSprint && (
                                            <IconButton
                                                color="info"
                                                onClick={() => setOpenModal(true)}
                                                title="Edit Sprint"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Empty State */}
            {sprints.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No sprints found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Create your first sprint to start tracking work
                    </Typography>
                    {canCreateSprint && (
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenModal(true)}
                        >
                            Create First Sprint
                        </Button>
                    )}
                </Paper>
            )}

            {/* Sprint Modal */}
            <SprintModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={fetchSprints}
            />
        </Box>
    );
};

export default SprintList;