import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Snackbar,
    Alert,
} from '@mui/material';

import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';

import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import KanbanColumn from '../../components/kanban/KanbanColumn.jsx';
import IssueCard from '../../components/kanban/IssueCard.jsx';
import IssueModal from '../../components/modals/IssueModal.jsx';
import Loader from '../../components/common/Loader.jsx';

import {
    fetchIssues,
    updateIssueStatus,
    moveIssueLocally,
} from '../../app/slices/issueSlice.js';

const DEFAULT_STATUSES = ['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const KanbanBoard = () => {
    const dispatch = useDispatch();

    const { kanbanIssues, loading } = useSelector((state) => state.issues);
    const { currentProject } = useSelector((state) => state.projectContext);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [activeId, setActiveId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState('ALL');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: isMobile ? 12 : 8,
            },
        })
    );

    useEffect(() => {
        if (!currentProject?.id) return;
        console.log('📥 Loading issues for project:', currentProject.id);
        dispatch(fetchIssues(currentProject.id));
    }, [dispatch, currentProject?.id]);

    const handleDragStart = (event) => {
        console.log('🎯 Drag started - Issue ID:', event.active.id);
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        console.log('🎯 Drag ended:', { activeId: active.id, overId: over?.id });
        
        setActiveId(null);

        if (!over) {
            console.log('❌ Dropped outside - no target');
            return;
        }

        // Find source and destination columns
        let fromStatus = null;
        let toStatus = null;

        Object.entries(kanbanIssues).forEach(([status, issues]) => {
            if (issues.some(i => i.id === active.id)) {
                fromStatus = status;
                console.log(`📍 Found issue in ${status}`);
            }
        });

        Object.entries(kanbanIssues).forEach(([status, issues]) => {
            if (issues.some(i => i.id === over.id)) {
                toStatus = status;
                console.log(`🎯 Dropped on issue in ${status}`);
            } else if (over.id === status) {
                toStatus = status;
                console.log(`🎯 Dropped on empty ${status}`);
            }
        });

        console.log(`🔄 Move summary: ${fromStatus} → ${toStatus}`);

        if (!fromStatus || !toStatus) {
            console.warn('❌ Could not determine columns');
            return;
        }

        if (fromStatus === toStatus) {
            console.log('⏭️ Same column - no action needed');
            return;
        }

        console.log(`✅ Valid move: ${active.id} from ${fromStatus} to ${toStatus}`);

        // Optimistic update
        dispatch(moveIssueLocally({
            issueId: active.id,
            fromStatus,
            toStatus,
        }));

        try {
            const result = await dispatch(updateIssueStatus({
                issueId: active.id,
                status: toStatus,
            })).unwrap();
            
            console.log('✅ Backend update successful:', result);
            
            setSnackbar({
                open: true,
                message: '✅ Issue moved successfully!',
                severity: 'success'
            });
            
        } catch (err) {
            console.error('❌ Backend update failed:', err);
            console.error('❌ Error details:', {
                message: err?.message,
                error: err?.error,
                available: err?.available_transitions
            });
            
            // Rollback optimistic update
            console.log('🔄 Rolling back...');
            dispatch(moveIssueLocally({
                issueId: active.id,
                fromStatus: toStatus,
                toStatus: fromStatus,
            }));
            
            // Re-fetch from backend to ensure sync
            console.log('🔄 Re-fetching from backend...');
            await dispatch(fetchIssues(currentProject.id));
            console.log('✅ Re-fetched from backend');
            
            const errorMsg = err?.error || err?.message || 'Failed to move issue';
            setSnackbar({
                open: true,
                message: `❌ ${errorMsg}`,
                severity: 'error'
            });
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'LOW': return 'success';
            case 'MEDIUM': return 'info';
            case 'HIGH': return 'warning';
            case 'CRITICAL': return 'error';
            default: return 'default';
        }
    };

    const filteredIssues = (status) => {
        let issues = kanbanIssues[status] || [];
        if (selectedPriority !== 'ALL') {
            issues = issues.filter(i => i.priority === selectedPriority);
        }
        return issues;
    };

    if (loading) return <Loader />;

    return (
        <Box p={2}>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* HEADER */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems={isMobile ? 'stretch' : 'center'}
                flexDirection={isMobile ? 'column' : 'row'}
                mb={2}
                gap={2}
            >
                <Typography variant="h4" fontWeight="bold">
                    Kanban Board
                </Typography>

                <Box display="flex" gap={2} flexDirection={isMobile ? 'column' : 'row'}>
                    <Button
                        startIcon={<FilterIcon />}
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                    >
                        Filter: {selectedPriority}
                    </Button>

                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={() => setFilterAnchorEl(null)}
                    >
                        {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                            <MenuItem
                                key={p}
                                onClick={() => {
                                    setSelectedPriority(p);
                                    setFilterAnchorEl(null);
                                }}
                            >
                                <Chip
                                    label={p}
                                    color={getPriorityColor(p)}
                                    size="small"
                                />
                            </MenuItem>
                        ))}
                    </Menu>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                    >
                        Create Issue
                    </Button>
                </Box>
            </Box>

            {/* BOARD */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Box display="flex" gap={2} overflow="auto">
                    {DEFAULT_STATUSES.map((status) => (
                        <KanbanColumn
                            key={status}
                            id={status}
                            title={status.replace(/_/g, ' ')}
                            count={filteredIssues(status).length}
                        >
                            <SortableContext
                                items={filteredIssues(status).map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {filteredIssues(status).map((issue) => (
                                    <IssueCard
                                        key={issue.id}
                                        id={issue.id}
                                        issue={issue}
                                        priorityColor={getPriorityColor(issue.priority)}
                                    />
                                ))}
                            </SortableContext>
                        </KanbanColumn>
                    ))}
                </Box>

                <DragOverlay>
                    {activeId && (
                        <Paper sx={{ p: 2, width: 260, opacity: 0.8, boxShadow: 6 }}>
                            <Typography fontWeight="bold">
                                {Object.values(kanbanIssues)
                                    .flat()
                                    .find(i => i.id === activeId)?.title || 'Dragging...'}
                            </Typography>
                        </Paper>
                    )}
                </DragOverlay>
            </DndContext>

            {/* MODAL */}
            <IssueModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                projectId={currentProject?.id}
            />
        </Box>
    );
};

export default KanbanBoard;