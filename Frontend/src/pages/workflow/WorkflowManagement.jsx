import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  useTheme,
  Stack,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Tooltip,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ArrowForward as ArrowIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const WorkflowManagement = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // State
  const [workflow, setWorkflow] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [openAddStatus, setOpenAddStatus] = useState(false);
  const [openEditStatus, setOpenEditStatus] = useState(false);
  const [openAddTransition, setOpenAddTransition] = useState(false);
  
  // Forms
  const [statusForm, setStatusForm] = useState({
    name: '',
    color: '#0052CC',
    is_start: false,
    is_terminal: false,
  });
  
  const [editingStatus, setEditingStatus] = useState(null);
  const [transitionForm, setTransitionForm] = useState({
    from_status: '',
    to_status: '',
  });

  // Snackbar
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  // Colors
  const statusColors = [
    '#6B7280', '#3B82F6', '#F59E0B', '#8B5CF6', 
    '#10B981', '#EF4444', '#EC4899', '#06B6D4',
  ];

  // Fetch workflow
  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      
      const workflowRes = await fetch('http://localhost:8000/api/workflows/workflows/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const workflows = await workflowRes.json();
      const activeWorkflow = workflows[0];
      
      if (!activeWorkflow) {
        showSnack('No workflow found. Please create one.', 'error');
        setLoading(false);
        return;
      }

      setWorkflow(activeWorkflow);

      const statusRes = await fetch(
        `http://localhost:8000/api/workflows/workflows/${activeWorkflow.id}/statuses/list/`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } }
      );
      const statusData = await statusRes.json();
      
      // Sort by order
      const sortedStatuses = statusData.sort((a, b) => a.order - b.order);
      setStatuses(sortedStatuses);

      const transRes = await fetch(
        `http://localhost:8000/api/workflows/workflows/${activeWorkflow.id}/transitions/list/`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` } }
      );
      const transData = await transRes.json();
      setTransitions(transData);

      console.log('✅ Workflow loaded:', activeWorkflow.name);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch workflow:', error);
      showSnack('Failed to load workflow', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const showSnack = (message, severity = 'success') => {
    setSnackMsg(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  // ✅ DRAG & DROP HANDLER
  const handleDragEnd = async (result) => {
    if (!result.destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    // No change in position
    if (
      result.source.droppableId === result.destination.droppableId &&
      result.source.index === result.destination.index
    ) {
      console.log('❌ Same position - no change');
      return;
    }

    const items = Array.from(statuses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order field
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    // Optimistic update
    setStatuses(updatedItems);

    try {
      console.log('🔄 Reordering columns...');
      console.log('📋 New order:', updatedItems.map(i => `${i.name} (${i.order})`));
      
      // Create array of IDs in new order
      const orderArray = updatedItems.map(item => item.id);
      console.log('📤 Sending to backend:', orderArray);
      
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/statuses/reorder/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ order: orderArray })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to reorder statuses');
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      showSnack(data.message || 'Column order updated successfully!');
      
      // Refresh to sync with backend
      await fetchWorkflow();
      
    } catch (error) {
      console.error('❌ Failed to reorder:', error);
      showSnack(error.message || 'Failed to update column order', 'error');
      
      // Revert optimistic update
      await fetchWorkflow();
    }
  };

  // Add Status
  const handleAddStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/statuses/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: statusForm.name,
            order: statuses.length + 1,
            color: statusForm.color,
            is_start: statusForm.is_start,
            is_terminal: statusForm.is_terminal,
          })
        }
      );

      if (!response.ok) throw new Error('Failed to add status');

      showSnack(`Status "${statusForm.name}" added successfully!`);
      setOpenAddStatus(false);
      setStatusForm({ name: '', color: '#0052CC', is_start: false, is_terminal: false });
      fetchWorkflow();
    } catch (error) {
      console.error('❌ Failed to add status:', error);
      showSnack('Failed to add status', 'error');
    }
  };

  // Edit Status
  const handleEditStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/statuses/${editingStatus.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editingStatus.name,
            color: editingStatus.color,
            is_start: editingStatus.is_start,
            is_terminal: editingStatus.is_terminal,
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      showSnack(`Status updated successfully!`);
      setOpenEditStatus(false);
      setEditingStatus(null);
      fetchWorkflow();
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      showSnack('Failed to update status', 'error');
    }
  };

  // Delete Status
  const handleDeleteStatus = async (statusId) => {
    if (!window.confirm('Are you sure you want to delete this status?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/statuses/${statusId}/delete/`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete status');
      }

      showSnack('Status deleted successfully!');
      fetchWorkflow();
    } catch (error) {
      console.error('❌ Failed to delete status:', error);
      showSnack(error.message, 'error');
    }
  };

  // Add Transition
  const handleAddTransition = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/transitions/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from_status: parseInt(transitionForm.from_status),
            to_status: parseInt(transitionForm.to_status),
          })
        }
      );

      if (!response.ok) throw new Error('Failed to add transition');

      showSnack('Transition added successfully!');
      setOpenAddTransition(false);
      setTransitionForm({ from_status: '', to_status: '' });
      fetchWorkflow();
    } catch (error) {
      console.error('❌ Failed to add transition:', error);
      showSnack('Failed to add transition', 'error');
    }
  };

  // Delete Transition
  const handleDeleteTransition = async (transitionId) => {
    if (!window.confirm('Delete this transition?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/transitions/${transitionId}/delete/`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }
      );

      if (!response.ok) throw new Error('Failed to delete transition');

      showSnack('Transition deleted!');
      fetchWorkflow();
    } catch (error) {
      console.error('❌ Failed to delete transition:', error);
      showSnack('Failed to delete transition', 'error');
    }
  };

  // Auto-create transitions
  const handleAutoCreateTransitions = async () => {
    if (!window.confirm('Create transitions between ALL statuses?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/workflows/workflows/${workflow.id}/transitions/auto-create/`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }
      );

      const data = await response.json();
      showSnack(`${data.message}! Total: ${data.total_transitions} transitions`);
      fetchWorkflow();
    } catch (error) {
      console.error('❌ Failed to auto-create transitions:', error);
      showSnack('Failed to create transitions', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading workflow...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', minHeight: '100vh' }}>
      {/* Snackbar */}
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
          {snackMsg}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="600" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D', mb: 0.5 }}>
            ⚙️ Workflow Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {workflow?.name} • {statuses.length} columns • {transitions.length} transitions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<RefreshIcon />} onClick={fetchWorkflow} variant="outlined">
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Kanban Columns */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500">
                📋 Kanban Columns
              </Typography>
              <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenAddStatus(true)} size="small">
                Add Column
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
              💡 <strong>Drag & Drop</strong> to reorder columns. Grab the ☰ icon and move up/down.
            </Alert>

            {/* Drag & Drop */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="statuses">
                {(provided, snapshot) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      bgcolor: snapshot.isDraggingOver ? (isDarkMode ? '#2C3135' : '#F4F5F7') : 'transparent',
                      borderRadius: '8px',
                      minHeight: '200px',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    {statuses.map((status, index) => (
                      <Draggable key={String(status.id)} draggableId={String(status.id)} index={index}>
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            sx={{
                              mb: 1,
                              p: 2,
                              borderRadius: '8px',
                              border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                              bgcolor: snapshot.isDragging ? (isDarkMode ? '#505963' : '#E3E8EF') : (isDarkMode ? '#1D2125' : '#FFFFFF'),
                              boxShadow: snapshot.isDragging ? '0 8px 20px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)',
                              transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: isDarkMode ? '#2C3135' : '#F4F5F7',
                                borderColor: isDarkMode ? '#505963' : '#B3BAC5',
                              },
                            }}
                          >
                            {/* Drag Handle */}
                            <Box
                              {...provided.dragHandleProps}
                              sx={{
                                mr: 2,
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                                '&:active': { cursor: 'grabbing' },
                              }}
                            >
                              <DragIcon />
                            </Box>

                            <Chip
                              label={status.order}
                              size="small"
                              sx={{
                                mr: 2,
                                bgcolor: status.color,
                                color: 'white',
                                fontWeight: 600,
                                minWidth: 32,
                              }}
                            />

                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1" fontWeight="500">
                                    {status.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    ({status.slug})
                                  </Typography>
                                  {status.is_start && <Chip label="START" size="small" color="success" />}
                                  {status.is_terminal && <Chip label="END" size="small" color="error" />}
                                </Box>
                              }
                              secondary={`${status.issues_count || 0} issues`}
                            />

                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingStatus(status);
                                  setOpenEditStatus(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteStatus(status.id)}
                                sx={{ color: '#DE350B' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>

            {statuses.length === 0 && (
              <Alert severity="info">
                No columns found. Add your first column to get started!
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Transitions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500">
                🔗 Transitions
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Auto-create all transitions">
                  <IconButton size="small" onClick={handleAutoCreateTransitions} color="primary">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton size="small" onClick={() => setOpenAddTransition(true)} color="primary">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {transitions.map((trans) => (
                <ListItem
                  key={trans.id}
                  sx={{
                    border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                    borderRadius: '8px',
                    mb: 0.5,
                    py: 0.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem' }}>
                        <Chip label={trans.from_status_name} size="small" />
                        <ArrowIcon fontSize="small" />
                        <Chip label={trans.to_status_name} size="small" />
                      </Box>
                    }
                  />
                  <IconButton size="small" onClick={() => handleDeleteTransition(trans.id)} sx={{ color: '#DE350B' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {transitions.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No transitions configured. Click settings to auto-create!
              </Alert>
            )}
          </Paper>

          {/* Stats */}
          <Card sx={{ mt: 2, bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Workflow Stats
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Columns:</Typography>
                  <Chip label={statuses.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Transitions:</Typography>
                  <Chip label={transitions.length} size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Max Possible:</Typography>
                  <Chip label={statuses.length * (statuses.length - 1)} size="small" color="info" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Status Dialog */}
      <Dialog open={openAddStatus} onClose={() => setOpenAddStatus(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Status Name"
              fullWidth
              value={statusForm.name}
              onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
              placeholder="e.g., Testing, QA, Staging"
            />
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {statusColors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setStatusForm({ ...statusForm, color })}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: statusForm.color === color ? '3px solid #0052CC' : '2px solid transparent',
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={statusForm.is_start}
                  onChange={(e) => setStatusForm({ ...statusForm, is_start: e.target.checked })}
                />
              }
              label="Start Status (Default for new issues)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={statusForm.is_terminal}
                  onChange={(e) => setStatusForm({ ...statusForm, is_terminal: e.target.checked })}
                />
              }
              label="Terminal Status (Completed state)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddStatus(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStatus} disabled={!statusForm.name}>
            Add Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={openEditStatus} onClose={() => setOpenEditStatus(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Status</DialogTitle>
        <DialogContent>
          {editingStatus && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Status Name"
                fullWidth
                value={editingStatus.name}
                onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
              />
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {statusColors.map((color) => (
                    <Box
                      key={color}
                      onClick={() => setEditingStatus({ ...editingStatus, color })}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: color,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: editingStatus.color === color ? '3px solid #0052CC' : '2px solid transparent',
                        '&:hover': { transform: 'scale(1.1)' },
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={editingStatus.is_start}
                    onChange={(e) => setEditingStatus({ ...editingStatus, is_start: e.target.checked })}
                  />
                }
                label="Start Status"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editingStatus.is_terminal}
                    onChange={(e) => setEditingStatus({ ...editingStatus, is_terminal: e.target.checked })}
                  />
                }
                label="Terminal Status"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditStatus(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditStatus}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transition Dialog */}
      <Dialog open={openAddTransition} onClose={() => setOpenAddTransition(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Transition</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="From Status"
              fullWidth
              value={transitionForm.from_status}
              onChange={(e) => setTransitionForm({ ...transitionForm, from_status: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">Select Status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </TextField>

            <TextField
              select
              label="To Status"
              fullWidth
              value={transitionForm.to_status}
              onChange={(e) => setTransitionForm({ ...transitionForm, to_status: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">Select Status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </TextField>

            <Alert severity="info" sx={{ borderRadius: '8px' }}>
              This will allow issues to be moved from "{statuses.find(s => s.id === parseInt(transitionForm.from_status))?.name || '...'}" 
              to "{statuses.find(s => s.id === parseInt(transitionForm.to_status))?.name || '...'}"
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddTransition(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTransition}
            disabled={!transitionForm.from_status || !transitionForm.to_status}
          >
            Add Transition
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowManagement;