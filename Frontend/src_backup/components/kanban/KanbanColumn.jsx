import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, Paper, Typography, Chip } from '@mui/material';

const KanbanColumn = ({ id, title, count, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <Box sx={{ minWidth: 300, flex: 1 }}>
            <Paper
                ref={setNodeRef}
                sx={{
                    p: 2,
                    height: '100%',
                    bgcolor: isOver ? 'action.hover' : 'background.paper',
                    border: isOver ? '2px dashed' : '2px solid', // Changed from 1px to 2px solid
                    borderColor: isOver ? 'primary.main' : '#00000033', // Darker border color for normal state
                    borderRadius: 1, // Made border radius smaller for sharper corners (from 2 to 1)
                    transition: 'all 0.2s',
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        {title}
                    </Typography>
                    <Chip label={count} color="primary" size="small" />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        minHeight: '60vh',
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        pr: 1,
                    }}
                >
                    {children}
                </Box>
            </Paper>
        </Box>
    );
};

export default KanbanColumn;