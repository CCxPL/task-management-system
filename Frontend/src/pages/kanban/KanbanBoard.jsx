import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Chip,
    Avatar,
    Button,
    IconButton,
    useTheme,
    Alert,
    Snackbar,  // ✅ ADD THIS
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { fetchIssues, updateIssueStatus } from '../../app/slices/issueSlice';
import IssueModal from '../../components/modals/IssueModal';
import Loader from '../../components/common/Loader';

const KanbanBoard = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const { currentProject } = useSelector((state) => state.projectContext);
    const { list: issuesList, loading } = useSelector((state) => state.issues);

    const [openModal, setOpenModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [workflowColumns, setWorkflowColumns] = useState([]);
    const [loadingWorkflow, setLoadingWorkflow] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [groupedIssues, setGroupedIssues] = useState({});

    // ✅ Snackbar State
    const [snackOpen, setSnackOpen] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const [snackSeverity, setSnackSeverity] = useState('success');

    // ✅ Helper function to show notifications
    const showNotification = (message, severity = 'success') => {
        setSnackMessage(message);
        setSnackSeverity(severity);
        setSnackOpen(true);
    };

    // Group issues by workflow slug
    useEffect(() => {
        if (issuesList && Array.isArray(issuesList) && workflowColumns.length > 0) {
            console.log('📊 Grouping issues...');
            
            const grouped = {};
            
            // Initialize all columns
            workflowColumns.forEach(column => {
                grouped[column.slug] = [];
            });
            
            // Group issues
            issuesList.forEach(issue => {
                const issueStatusSlug = 
                    issue.workflow_status_slug || 
                    issue.status_slug || 
                    issue.status?.toLowerCase().replace(/_/g, '-');
                
                const matchingColumn = workflowColumns.find(col => 
                    col.slug === issueStatusSlug || 
                    col.frontendKey === issue.status
                );
                
                if (matchingColumn) {
                    grouped[matchingColumn.slug].push(issue);
                } else {
                    console.warn(`⚠️ No matching column for issue ${issue.id}`);
                }
            });
            
            setGroupedIssues(grouped);
            console.log('✅ Issues grouped:', grouped);
        }
    }, [issuesList, workflowColumns]);

    // Fetch workflow columns AND issues
    useEffect(() => {
        if (currentProject?.id) {
            loadKanbanBoard();
        }
    }, [currentProject?.id]);

    const loadKanbanBoard = async () => {
        try {
            setLoadingWorkflow(true);
            
            console.log('📥 Fetching workflow and issues...');
            
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            
            // Fetch workflow
            const workflowRes = await fetch('${import.meta.env.VITE_API_URL}/api/workflows/workflows/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const workflows = await workflowRes.json();
            const activeWorkflow = workflows[0];
            
            if (!activeWorkflow) {
                showNotification('No workflow found. Please configure workflow first.', 'error');
                setLoadingWorkflow(false);
                return;
            }

            // Fetch statuses
            const statusRes = await fetch(
                `${import.meta.env.VITE_API_URL}/api/workflows/workflows/${activeWorkflow.id}/statuses/list/`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const statuses = await statusRes.json();
            
            const sortedStatuses = statuses.sort((a, b) => a.order - b.order);
            
            const columns = sortedStatuses.map(status => ({
                id: status.id,
                name: status.name,
                slug: status.slug,
                frontendKey: status.slug.toUpperCase().replace(/-/g, '_'),
                color: status.color || '#0052CC',
                order: status.order,
            }));
            
            setWorkflowColumns(columns);
            
            // Fetch issues
            await dispatch(fetchIssues(currentProject.id)).unwrap();
            
            console.log('✅ Kanban board loaded');
            
        } catch (error) {
            console.error('❌ Failed to load kanban board:', error);
            showNotification('Failed to load kanban board', 'error');
        } finally {
            setLoadingWorkflow(false);
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = async (result) => {
        setIsDragging(false);

        const { source, destination, draggableId } = result;

        if (!destination) {
            console.log('❌ No destination - drag cancelled');
            return;
        }
        
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            console.log('❌ Same position - no change');
            return;
        }

        const issueId = parseInt(draggableId);
        const fromStatusSlug = source.droppableId;
        const toStatusSlug = destination.droppableId;

        // Get issue details
        const movedIssue = groupedIssues[fromStatusSlug]?.[source.index];
        const fromColumn = workflowColumns.find(col => col.slug === fromStatusSlug);
        const toColumn = workflowColumns.find(col => col.slug === toStatusSlug);

        console.log(`🔄 Moving issue ${issueId} from "${fromColumn?.name}" to "${toColumn?.name}"`);

        // Optimistic update
        const updatedGroups = { ...groupedIssues };
        const sourceIssues = [...(updatedGroups[source.droppableId] || [])];
        const destIssues = source.droppableId === destination.droppableId 
            ? sourceIssues 
            : [...(updatedGroups[destination.droppableId] || [])];

        const [movedItem] = sourceIssues.splice(source.index, 1);
        
        destIssues.splice(destination.index, 0, { 
            ...movedItem, 
            workflow_status_slug: toStatusSlug,
            status_slug: toStatusSlug,
            status: toStatusSlug.toUpperCase().replace(/-/g, '_')
        });

        updatedGroups[source.droppableId] = sourceIssues;
        updatedGroups[destination.droppableId] = destIssues;
        
        setGroupedIssues(updatedGroups);

        try {
            // Update backend
            await dispatch(updateIssueStatus({ 
                issueId, 
                status: toStatusSlug 
            })).unwrap();
            
            console.log('✅ Backend updated');
            
            // ✅ SUCCESS NOTIFICATION
            showNotification(
                `${movedIssue?.issue_key || 'Issue'} moved to "${toColumn?.name}" successfully!`,
                'success'
            );
            
            // Refresh to sync with backend
            await dispatch(fetchIssues(currentProject.id)).unwrap();
            
        } catch (error) {
            console.error('❌ Failed to update issue:', error);
            
            // ✅ ERROR NOTIFICATION
            const errorMessage = error?.response?.data?.error || 
                                error?.message || 
                                'Failed to move issue';
            
            // Check for invalid transition error
            if (errorMessage.includes('Invalid transition') || 
                errorMessage.includes('not allowed') ||
                error?.response?.status === 400) {
                showNotification(
                    `❌ Invalid transition: Cannot move from "${fromColumn?.name}" to "${toColumn?.name}"`,
                    'error'
                );
            } else {
                showNotification(
                    `Failed to move issue: ${errorMessage}`,
                    'error'
                );
            }
            
            // Revert optimistic update
            await dispatch(fetchIssues(currentProject.id)).unwrap();
        }
    };

    if (loading || loadingWorkflow) return <Loader />;

    if (!currentProject) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: '16px' }}>
                    <Typography variant="h6" color="textSecondary">
                        Please select a project to view the Kanban board
                    </Typography>
                </Paper>
            </Box>
        );
    }

    if (workflowColumns.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning" sx={{ borderRadius: '12px', mb: 2 }}>
                    No workflow columns found. Please add columns in Workflow Settings first.
                </Alert>
                <Button
                    variant="contained"
                    onClick={loadKanbanBoard}
                    sx={{ borderRadius: '8px' }}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    const totalIssues = Object.values(groupedIssues).reduce((acc, arr) => acc + arr.length, 0);

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            {/* ✅ SNACKBAR NOTIFICATION */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    severity={snackSeverity} 
                    onClose={() => setSnackOpen(false)}
                    sx={{ borderRadius: '8px' }}
                >
                    {snackMessage}
                </Alert>
            </Snackbar>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography 
                        variant="h4" 
                        fontWeight="700"
                        sx={{
                            background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Kanban Board
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {currentProject.name} • {workflowColumns.length} columns • {totalIssues} issues
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton
                        onClick={() => {
                            loadKanbanBoard();
                            showNotification('Board refreshed!', 'info');
                        }}
                        disabled={isDragging}
                        sx={{
                            bgcolor: isDarkMode ? '#22272B' : '#F4F5F7',
                            borderRadius: '8px',
                            '&:hover': { bgcolor: isDarkMode ? '#2C3137' : '#EBECF0' }
                        }}
                        title="Refresh board"
                    >
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedIssue(null);
                            setOpenModal(true);
                        }}
                        disabled={isDragging}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                        }}
                    >
                        Create Issue
                    </Button>
                </Box>
            </Box>

            {/* Kanban Columns */}
            <DragDropContext 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    overflowX: 'auto',
                    height: 'calc(100% - 80px)',
                    pb: 2,
                }}>
                    {workflowColumns.map((column) => {
                        const columnIssues = groupedIssues[column.slug] || [];
                        
                        return (
                            <Droppable 
                                key={column.slug} 
                                droppableId={column.slug}
                            >
                                {(provided, snapshot) => (
                                    <Paper
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        sx={{
                                            minWidth: '320px',
                                            maxWidth: '320px',
                                            bgcolor: snapshot.isDraggingOver 
                                                ? (isDarkMode ? '#2C3137' : '#E3F2FD')
                                                : (isDarkMode ? '#1D2125' : '#F4F5F7'),
                                            borderRadius: '12px',
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            maxHeight: '100%',
                                            transition: 'background-color 0.2s ease',
                                            border: `2px solid ${snapshot.isDraggingOver ? column.color : 'transparent'}`,
                                        }}
                                    >
                                        {/* Column Header */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mb: 2,
                                            pb: 1.5,
                                            borderBottom: `3px solid ${column.color}`,
                                        }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight="600">
                                                    {column.name}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={columnIssues.length} 
                                                size="small"
                                                sx={{ 
                                                    bgcolor: column.color,
                                                    color: 'white',
                                                    fontWeight: '700',
                                                }}
                                            />
                                        </Box>

                                        {/* Issues */}
                                        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
                                            {columnIssues.length === 0 ? (
                                                <Box sx={{ 
                                                    textAlign: 'center', 
                                                    py: 6,
                                                    bgcolor: isDarkMode ? '#22272B' : '#FFFFFF',
                                                    borderRadius: '8px',
                                                    border: `2px dashed ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                                                }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        No issues
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                columnIssues.map((issue, index) => (
                                                    <Draggable
                                                        key={String(issue.id)}
                                                        draggableId={String(issue.id)}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => {
                                                                    if (!isDragging) {
                                                                        setSelectedIssue(issue);
                                                                        setOpenModal(true);
                                                                    }
                                                                }}
                                                                sx={{
                                                                    mb: 1.5,
                                                                    cursor: isDragging ? 'grabbing' : 'pointer',
                                                                    borderRadius: '8px',
                                                                    bgcolor: isDarkMode ? '#22272B' : '#FFFFFF',
                                                                    borderLeft: `4px solid ${
                                                                        issue.priority === 'CRITICAL' ? '#D32F2F' :
                                                                        issue.priority === 'HIGH' ? '#FF5630' :
                                                                        issue.priority === 'MEDIUM' ? '#FFAB00' :
                                                                        '#36B37E'
                                                                    }`,
                                                                    boxShadow: snapshot.isDragging 
                                                                        ? '0 8px 16px rgba(0,0,0,0.3)' 
                                                                        : '0 1px 3px rgba(0,0,0,0.1)',
                                                                }}
                                                            >
                                                                <CardContent sx={{ p: 2 }}>
                                                                    <Typography variant="caption" color="textSecondary" fontWeight="600">
                                                                        {issue.issue_key}
                                                                    </Typography>
                                                                    <Typography variant="body1" fontWeight="500" sx={{ mt: 0.5, mb: 1 }}>
                                                                        {issue.title}
                                                                    </Typography>
                                                                    
                                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                                        <Chip label={issue.issue_type} size="small" />
                                                                        <Chip label={issue.priority} size="small" color="warning" />
                                                                    </Box>
                                                                    
                                                                    {issue.assignee && (
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                                                                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                                                                {issue.assignee.username?.charAt(0).toUpperCase()}
                                                                            </Avatar>
                                                                            <Typography variant="caption" color="textSecondary">
                                                                                {issue.assignee.username}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </Box>
                                    </Paper>
                                )}
                            </Droppable>
                        );
                    })}
                </Box>
            </DragDropContext>

            <IssueModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedIssue(null);
                }}
                issue={selectedIssue}
                onSuccess={() => {
                    dispatch(fetchIssues(currentProject.id));
                    showNotification('Issue saved successfully!', 'success');
                }}
            />
        </Box>
    );
};

export default KanbanBoard;