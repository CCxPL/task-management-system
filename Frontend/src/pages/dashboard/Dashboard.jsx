import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  Avatar,
  LinearProgress,
  Tooltip as MuiTooltip,
  Stack,
  Badge,
  AvatarGroup,
  InputAdornment
} from '@mui/material';

import {
  Folder as ProjectIcon,
  Group as TeamIcon,
  PlayArrow as SprintIcon,
  Warning as OverdueIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  ViewKanban as KanbanIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  FiberManualRecord as DotIcon,
  ChevronRight as ChevronRightIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,      // ✅ ADD THIS
  ContentCopy as ContentCopyIcon,      // ✅ ADD THIS
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { apiFetch } from '../../utils/apiHelper';
// Redux actions
import { fetchProjects, createProject } from '../../app/slices/projectSlice.js';
import { fetchIssues } from '../../app/slices/issueSlice.js';
import { fetchTeamMembers, addTeamMember } from '../../app/slices/teamSlice.js';
import { fetchSprintsByProject } from '../../app/slices/sprintSlice.js';
import { setCurrentProject } from '../../app/slices/projectContextSlice.js';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const { user } = useSelector(state => state.auth);
  const { list: projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { list: sprints, loading: sprintsLoading } = useSelector(state => state.sprints);
  const { list: issues, loading: issuesLoading } = useSelector(state => state.issues);
  const { list: teamMembers, loading: teamLoading } = useSelector(state => state.team);
  const { currentProject } = useSelector(state => state.projectContext || { currentProject: null });

  // Theme
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // ✅ Role-based access
  const userRole = user?.role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';
  const isMember = userRole === 'MEMBER';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // UI state
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState({ open: false, type: null, data: null });
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    key: '',
    description: '',
    start_date: '',
    end_date: '',
  });

// Update state to include password
const [memberForm, setMemberForm] = useState({
  name: '',
  email: '',
  role: 'MEMBER',
  password: '',  // ✅ ADD THIS
});
const [credentialsDialog, setCredentialsDialog] = useState({
  open: false,
  email: '',
  password: '',
  name: ''
});
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  // Helpers
  const orgId = user?.organization?.id || null;
  const defaultProjectId = currentProject?.id || projects?.[0]?.id || null;
  const loadingAny = projectsLoading || issuesLoading || teamLoading || sprintsLoading;

  // ✅ Computed data - Role-based filtering
  const myProjects = useMemo(() => {
    if (!projects) return [];
    
    if (isAdmin) return projects; // Admin sees all
    
    if (isManager || isMember) {
      // Filter projects where user is assigned
      // TODO: This needs backend support to return user's assigned projects
      return projects; // For now, show all (will be filtered by backend)
    }
    
    return [];
  }, [projects, userRole, isAdmin, isManager, isMember]);

  const myIssues = useMemo(() => {
    if (!issues) return [];
    
    if (isAdmin) return issues; // Admin sees all
    
    // Members and Managers see only their assigned issues
    return issues.filter(issue => 
      issue.assignee?.id === user?.id || 
      issue.assignee === user?.id
    );
  }, [issues, userRole, user?.id, isAdmin]);

  const activeSprintsCount = useMemo(() => {
    return sprints?.filter(s => 
      s.status?.toUpperCase() === 'ACTIVE'
    )?.length || 0;
  }, [sprints]);

  const activeSprints = useMemo(
    () => sprints?.filter(s => s.status?.toUpperCase() === 'ACTIVE') || [],
    [sprints]
  );

  const overdueCount = useMemo(() => {
    const now = new Date();
    const relevantIssues = isAdmin ? issues : myIssues;
    return relevantIssues?.filter(i => 
      i?.due_date && 
      new Date(i.due_date) < now && 
      i.status !== 'DONE'
    )?.length || 0;
  }, [issues, myIssues, isAdmin]);

  const overdueIssues = useMemo(() => {
    const now = new Date();
    const relevantIssues = isAdmin ? issues : myIssues;
    return relevantIssues?.filter(i => 
      i?.due_date && 
      new Date(i.due_date) < now && 
      i.status !== 'DONE'
    ) || [];
  }, [issues, myIssues, isAdmin]);

  // ✅ Task distribution (for all roles)
  const taskDistribution = useMemo(() => {
    const relevantIssues = isAdmin ? issues : myIssues;
    
    return [
      { 
        name: 'To Do', 
        value: relevantIssues?.filter(t => 
          t.status?.includes('TODO') || 
          t.status?.includes('BACKLOG') ||
          t.status === 'TO_DO'
        ).length || 0,
        color: '#0052CC'
      },
      { 
        name: 'In Progress', 
        value: relevantIssues?.filter(t => 
          t.status?.includes('PROGRESS') ||
          t.status === 'IN_PROGRESS'
        ).length || 0,
        color: '#FF991F'
      },
      { 
        name: 'Review', 
        value: relevantIssues?.filter(t => 
          t.status?.includes('REVIEW')
        ).length || 0,
        color: '#6554C0'
      },
      { 
        name: 'Done', 
        value: relevantIssues?.filter(t => 
          t.status === 'DONE'
        ).length || 0,
        color: '#36B37E'
      },
    ];
  }, [issues, myIssues, isAdmin]);

  // ✅ Issue type breakdown
  const issueTypeData = useMemo(() => {
    const relevantIssues = isAdmin ? issues : myIssues;
    
    return [
      { name: 'Task', count: relevantIssues?.filter(i => i.issue_type === 'TASK').length || 0 },
      { name: 'Bug', count: relevantIssues?.filter(i => i.issue_type === 'BUG').length || 0 },
      { name: 'Story', count: relevantIssues?.filter(i => i.issue_type === 'STORY').length || 0 },
    ];
  }, [issues, myIssues, isAdmin]);

  const recentIssues = useMemo(() => {
    const relevantIssues = isAdmin ? issues : myIssues;
    return [...(relevantIssues || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [issues, myIssues, isAdmin]);

  const COLORS = {
    TODO: '#0052CC',
    IN_PROGRESS: '#FF991F',
    REVIEW: '#6554C0',
    DONE: '#36B37E',
  };
// Add this at the very top of Dashboard component, right after hooks

// ✅ SUPER_ADMIN ko redirect kar do apne dashboard pe
useEffect(() => {
  if (user?.role === 'SUPER_ADMIN') {
    navigate('/super-admin/dashboard');
  }
}, [user, navigate]);

// If SUPER_ADMIN somehow reaches here, show nothing
if (isSuperAdmin) {
  return null;
}
  // Fetch data
  useEffect(() => {
    if (!user) return;
    console.log('📥 Dashboard: Fetching initial data...');
    dispatch(fetchProjects());
    dispatch(fetchTeamMembers());
  }, [dispatch, user]);

  useEffect(() => {
    if (!projects?.length) return;
    if (!currentProject) {
      dispatch(setCurrentProject(projects[0]));
      return;
    }
    const exists = projects.some(p => p.id === currentProject.id);
    if (!exists) dispatch(setCurrentProject(projects[0]));
  }, [dispatch, projects, currentProject]);

  useEffect(() => {
    if (!defaultProjectId) return;
    console.log('📥 Dashboard: Fetching project data for:', defaultProjectId);
    dispatch(fetchIssues(defaultProjectId));
    dispatch(fetchSprintsByProject(defaultProjectId));
  }, [dispatch, defaultProjectId]);

  // Handlers
  const handleCardClick = (type) => {
    let data = null;
    switch(type) {
      case 'projects':
        data = myProjects;
        break;
      case 'team':
        data = teamMembers;
        break;
      case 'sprints':
        data = activeSprints.length > 0 ? activeSprints : sprints;
        break;
      case 'overdue':
        data = overdueIssues;
        break;
      case 'my-tasks':
        data = myIssues;
        break;
      default:
        data = [];
    }
    setDetailDrawer({ open: true, type, data });
  };

  const handleProjectChange = (e) => {
    setProjectForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleMemberChange = (e) => {
    setMemberForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleCreateProject = async () => {
    try {
      await dispatch(createProject({
        name: projectForm.name,
        key: projectForm.key,
        description: projectForm.description,
        start_date: projectForm.start_date,
        end_date: projectForm.end_date,
        organization_id: orgId,
        project_lead: user?.username || 'admin',
        status: 'ACTIVE',
      })).unwrap();

      setSnackMsg(`✅ Project "${projectForm.name}" created successfully!`);
      setSnackOpen(true);
      setOpenProjectModal(false);
      setProjectForm({ name: '', key: '', description: '', start_date: '', end_date: '' });
      dispatch(fetchProjects());
    } catch (err) {
      setSnackMsg(typeof err === 'string' ? err : '❌ Failed to create project');
      setSnackOpen(true);
    }
  };

  const handleCreateMember = async () => {
  try {
    console.log('📝 Creating member:', memberForm);
    
    const response = await fetch('${import.meta.env.VITE_API_URL}/api/accounts/create-org-user/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: memberForm.email,
        username: memberForm.name.toLowerCase().replace(/\s+/g, '_'),
        role: memberForm.role,
        password: memberForm.password  // ✅ Include password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create member');
    }

    console.log('✅ Member created:', data);

    // ✅ Show credentials in dialog
    if (data.credentials) {
      setCredentialsDialog({
        open: true,
        email: data.credentials.email,
        password: data.credentials.password,
        name: memberForm.name
      });
    }
    
    setOpenMemberModal(false);
    setMemberForm({ name: '', email: '', role: 'MEMBER', password: '' });
    
    // Refresh team members list
    dispatch(fetchTeamMembers());
    
  } catch (err) {
    console.error('❌ Failed to create member:', err);
    setSnackMsg(`❌ ${err.message || 'Failed to add member'}`);
    setSnackOpen(true);
  }
};
  const handleRefresh = () => {
    console.log('🔄 Refreshing dashboard data...');
    dispatch(fetchProjects());
    dispatch(fetchTeamMembers());
    if (defaultProjectId) {
      dispatch(fetchIssues(defaultProjectId));
      dispatch(fetchSprintsByProject(defaultProjectId));
    }
    setSnackMsg('✅ Dashboard refreshed!');
    setSnackOpen(true);
  };

  // Styles
  const cardStyle = {
    border: `1.5px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
    borderRadius: '3px',
    boxShadow: isDarkMode ? '0 1px 1px rgba(9, 30, 66, 0.25)' : '0 1px 1px rgba(9, 30, 66, 0.13)',
    backgroundColor: isDarkMode ? '#1D2125' : '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.1s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDarkMode ? '0 8px 16px rgba(9, 30, 66, 0.3)' : '0 8px 16px rgba(9, 30, 66, 0.15)',
      borderColor: '#0052CC',
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'CRITICAL': return '#DE350B';
      case 'HIGH': return '#FF5630';
      case 'MEDIUM': return '#FF991F';
      case 'LOW': return '#36B37E';
      default: return '#6B778C';
    }
  };

  const getStatusColor = (status) => {
    if (status?.includes('BACKLOG') || status?.includes('TODO') || status === 'TO_DO') return '#0052CC';
    if (status?.includes('PROGRESS')) return '#FF991F';
    if (status?.includes('REVIEW')) return '#6554C0';
    if (status === 'DONE') return '#36B37E';
    return '#6B778C';
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3, width: '100%', maxWidth: '100%', overflowX: 'hidden', bgcolor: isDarkMode ? '#1D2125' : '#F4F5F7' }}>
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" icon={<SuccessIcon />} onClose={() => setSnackOpen(false)} sx={{ borderRadius: '3px' }}>
          {snackMsg}
        </Alert>
      </Snackbar>

      {/* ✅ Header - Dynamic based on role */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="500" sx={{ mb: 0.5, color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
            {isAdmin && '🔧 Admin Dashboard'}
            {isManager && '📊 Manager Dashboard'}
            {isMember && '👤 My Dashboard'}
            {isSuperAdmin && '⚙️ Super Admin Dashboard'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isAdmin && `Managing ${myProjects.length} project${myProjects.length !== 1 ? 's' : ''} • ${teamMembers?.length || 0} team member${teamMembers?.length !== 1 ? 's' : ''}`}
            {isManager && `${myProjects.length} assigned project${myProjects.length !== 1 ? 's' : ''} • ${myIssues.length} task${myIssues.length !== 1 ? 's' : ''}`}
            {isMember && `${myProjects.length} project${myProjects.length !== 1 ? 's' : ''} • ${myIssues.length} assigned task${myIssues.length !== 1 ? 's' : ''}`}
            {isSuperAdmin && 'System Administration'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={handleRefresh} size="small" sx={{ bgcolor: isDarkMode ? '#22272B' : '#EBECF0' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Chip 
            icon={<AssignmentIcon />} 
            label={`${isAdmin ? issues?.length || 0 : myIssues.length} ${isAdmin ? 'Total' : 'My'} Issue${(isAdmin ? issues?.length : myIssues.length) !== 1 ? 's' : ''}`}
            sx={{ 
              bgcolor: '#0052CC', 
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-icon': { color: 'white' }
            }}
          />
        </Box>
      </Box>

      {loadingAny && <LinearProgress sx={{ mb: 2, borderRadius: '3px' }} />}

      {/* ✅ Stats Cards - Role-based */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Projects Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiTooltip title={`Click to view ${isAdmin ? 'all' : 'my'} projects`} arrow>
            <Card sx={cardStyle} onClick={() => handleCardClick('projects')}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#0052CC', width: 48, height: 48 }}>
                    <ProjectIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                      {myProjects.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                      {isAdmin ? 'Total Projects' : 'My Projects'}
                    </Typography>
                  </Box>
                  <ChevronRightIcon color="action" sx={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </MuiTooltip>
        </Grid>

        {/* Team Members / My Tasks Card */}
        {(isAdmin || isManager) ? (
          <Grid item xs={12} sm={6} md={3}>
            <MuiTooltip title="Click to view team members" arrow>
              <Card sx={cardStyle} onClick={() => handleCardClick('team')}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#00B8D9', width: 48, height: 48 }}>
                      <TeamIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                        {teamMembers?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                        Team Members
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" sx={{ opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </MuiTooltip>
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={3}>
            <MuiTooltip title="My assigned tasks" arrow>
              <Card sx={cardStyle} onClick={() => handleCardClick('my-tasks')}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#6554C0', width: 48, height: 48 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                        {myIssues.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                        My Tasks
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" sx={{ opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </MuiTooltip>
          </Grid>
        )}

        {/* Sprints Card - Only for Admin/Manager */}
        {(isAdmin || isManager) && (
          <Grid item xs={12} sm={6} md={3}>
            <MuiTooltip title="Click to view sprints" arrow>
              <Card sx={cardStyle} onClick={() => handleCardClick('sprints')}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge 
                      badgeContent={activeSprintsCount} 
                      color="success"
                      sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}
                    >
                      <Avatar sx={{ bgcolor: '#36B37E', width: 48, height: 48 }}>
                        <SprintIcon />
                      </Avatar>
                    </Badge>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                        {sprints?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                        {activeSprintsCount > 0 ? `${activeSprintsCount} Active` : 'Sprints'}
                      </Typography>
                    </Box>
                    <ChevronRightIcon color="action" sx={{ opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </MuiTooltip>
          </Grid>
        )}

        {/* Overdue Issues Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiTooltip title="Click to view overdue issues" arrow>
            <Card 
              sx={{ 
                ...cardStyle, 
                borderLeft: overdueCount > 0 ? '4px solid #DE350B' : `1.5px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}` 
              }} 
              onClick={() => handleCardClick('overdue')}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge 
                    badgeContent={overdueCount > 0 ? '!' : 0} 
                    color="error"
                  >
                    <Avatar sx={{ bgcolor: overdueCount > 0 ? '#DE350B' : '#6B778C', width: 48, height: 48 }}>
                      <OverdueIcon />
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight="500" sx={{ color: overdueCount > 0 ? '#DE350B' : (isDarkMode ? '#B6C2CF' : '#172B4D') }}>
                      {overdueCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                      Overdue Issues
                    </Typography>
                  </Box>
                  <ChevronRightIcon color="action" sx={{ opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </MuiTooltip>
        </Grid>
      </Grid>

      {/* ✅ Quick Actions & Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Quick Actions - Role-based */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '3px', border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                Quick Actions
              </Typography>
              <Chip 
                label={userRole} 
                size="small" 
                sx={{ 
                  bgcolor: isAdmin ? '#0052CC' : isManager ? '#FF991F' : '#6554C0',
                  color: 'white',
                  fontWeight: 500
                }} 
              />
            </Box>

            <Grid container spacing={2}>
              {/* Admin-specific actions */}
              {isAdmin && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ProjectIcon />}
                      onClick={() => setOpenProjectModal(true)}
                      disabled={!orgId}
                      sx={{ 
                        py: 1.5, 
                        bgcolor: '#0052CC',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#0747A6' }
                      }}
                    >
                      Create Project
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TeamIcon />}
                      onClick={() => setOpenMemberModal(true)}
                      disabled={!orgId}
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: '#DFE1E6',
                        color: isDarkMode ? '#B6C2CF' : '#42526E',
                        '&:hover': { borderColor: '#0052CC', bgcolor: 'rgba(0, 82, 204, 0.04)' }
                      }}
                    >
                      Add Member
                    </Button>
                  </Grid>
                </>
              )}

              {/* Manager-specific actions */}
              {isManager && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<SprintIcon />}
                      onClick={() => navigate('/sprints')}
                      sx={{ 
                        py: 1.5, 
                        bgcolor: '#36B37E',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#00875A' }
                      }}
                    >
                      Manage Sprints
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignmentIcon />}
                      onClick={() => setOpenProjectModal(true)} // TODO: Open task creation modal
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: '#DFE1E6',
                        color: isDarkMode ? '#B6C2CF' : '#42526E',
                        '&:hover': { borderColor: '#FF991F', bgcolor: 'rgba(255, 153, 31, 0.04)' }
                      }}
                    >
                      Assign Task
                    </Button>
                  </Grid>
                </>
              )}

              {/* Member-specific actions */}
              {isMember && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AssignmentIcon />}
                      onClick={() => handleCardClick('my-tasks')}
                      sx={{ 
                        py: 1.5, 
                        bgcolor: '#6554C0',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': { bgcolor: '#5243AA' }
                      }}
                    >
                      View My Tasks
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ScheduleIcon />}
                      onClick={() => navigate('/my-schedule')}
                      sx={{ 
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: '#DFE1E6',
                        color: isDarkMode ? '#B6C2CF' : '#42526E',
                        '&:hover': { borderColor: '#6554C0', bgcolor: 'rgba(101, 84, 192, 0.04)' }
                      }}
                    >
                      My Schedule
                    </Button>
                  </Grid>
                </>
              )}

              {/* Common actions for all roles */}
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<KanbanIcon />}
                  onClick={() => defaultProjectId && navigate(`/kanban?project=${defaultProjectId}`)}
                  disabled={!defaultProjectId}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: '#00B8D9',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#00A3BF' }
                  }}
                >
                  Open Board
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReportIcon />}
                  onClick={() => navigate('/reports')}
                  sx={{ 
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#DFE1E6',
                    color: isDarkMode ? '#B6C2CF' : '#42526E',
                    '&:hover': { borderColor: '#00B8D9', bgcolor: 'rgba(0, 184, 217, 0.04)' }
                  }}
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Role-based status info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DotIcon sx={{ fontSize: 10, color: '#0052CC' }} />
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#5E6C84' }}>
                  {isAdmin && `Managing ${myProjects.length} projects across organization`}
                  {isManager && `Managing ${myProjects.length} assigned projects`}
                  {isMember && `Working on ${myProjects.length} projects`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DotIcon sx={{ fontSize: 10, color: '#36B37E' }} />
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#5E6C84' }}>
                  {isAdmin ? `${issues?.length || 0} total issues` : `${myIssues.length} assigned tasks`}
                </Typography>
              </Box>
              {currentProject && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DotIcon sx={{ fontSize: 10, color: '#FF991F' }} />
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#5E6C84' }}>
                    Active project: <strong>{currentProject.name}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Task Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '3px', border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}` }}>
            <Typography variant="h6" fontWeight="500" gutterBottom sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
              {isAdmin ? 'All Issues' : 'My Tasks'} Distribution
            </Typography>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  labelLine={false}
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#22272B' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                    borderRadius: '3px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}>
              {taskDistribution.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: item.color }} />
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#5E6C84' }}>
                    {item.name}: <strong>{item.value}</strong>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Recent Activity & Team Info */}
      <Grid container spacing={2}>
        {/* Recent Issues */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: '3px', border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}` }}>
            <Typography variant="h6" fontWeight="500" gutterBottom sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D', mb: 2 }}>
              Recent {isAdmin ? 'Issues' : 'Tasks'}
            </Typography>
            
            {recentIssues.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '3px' }}>
                No recent {isAdmin ? 'issues' : 'tasks'} to display
              </Alert>
            ) : (
              <List sx={{ p: 0 }}>
                {recentIssues.map((issue, index) => (
                  <ListItem 
                    key={issue.id} 
                    sx={{ 
                      borderLeft: `3px solid ${getPriorityColor(issue.priority)}`,
                      mb: index < recentIssues.length - 1 ? 1.5 : 0,
                      bgcolor: isDarkMode ? '#22272B' : '#FAFBFC',
                      borderRadius: '3px',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                      '&:hover': {
                        bgcolor: isDarkMode ? '#2C333A' : '#F4F5F7',
                      }
                    }}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          bgcolor: issue.issue_type === 'BUG' ? '#DE350B' : issue.issue_type === 'STORY' ? '#36B37E' : '#0052CC',
                          fontSize: '0.75rem'
                        }}
                      >
                        {issue.issue_type === 'BUG' ? '🐛' : issue.issue_type === 'STORY' ? '📖' : '✓'}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="500" sx={{ mb: 0.5, color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                          {issue.title || issue.issue_key}
                        </Typography>
                        
                        {issue.title && issue.issue_key && (
                          <Typography variant="caption" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C', mb: 1, display: 'block' }}>
                            {issue.issue_key}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={issue.priority || 'MEDIUM'} 
                            size="small" 
                            sx={{ 
                              bgcolor: getPriorityColor(issue.priority), 
                              color: 'white', 
                              height: 22,
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }} 
                          />
                          <Chip 
                            label={issue.status || 'TODO'} 
                            size="small" 
                            sx={{ 
                              bgcolor: getStatusColor(issue.status),
                              color: 'white',
                              height: 22, 
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }} 
                          />
                          {issue.issue_type && (
                            <Chip 
                              label={issue.issue_type} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                height: 22, 
                                fontSize: '0.75rem',
                                borderColor: isDarkMode ? '#3D444D' : '#DFE1E6',
                                color: isDarkMode ? '#9FADBC' : '#5E6C84'
                              }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Team Members / Issue Type Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: '3px', border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}` }}>
            {(isAdmin || isManager) ? (
              <>
                <Typography variant="h6" fontWeight="500" gutterBottom sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D', mb: 2 }}>
                  Team Members
                </Typography>

                {!teamMembers || teamMembers.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: '3px' }}>
                    No team members yet
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                        {teamMembers.slice(0, 10).map(member => (
                          <MuiTooltip 
                            key={member.id || member.email} 
                            title={member.name || member.user?.username || member.email}
                            arrow
                          >
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: '#0052CC',
                                fontSize: '0.875rem',
                                fontWeight: 500
                              }}
                            >
                              {(member.name || member.user?.username || member.email || 'U')[0].toUpperCase()}
                            </Avatar>
                          </MuiTooltip>
                        ))}
                      </AvatarGroup>
                    </Box>

                    <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
                      {teamMembers.slice(0, 5).map((member, index) => (
                        <ListItem 
                          key={member.id || member.email} 
                          sx={{ 
                            px: 0, 
                            py: 1,
                            borderBottom: index < Math.min(teamMembers.length, 5) - 1 ? `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}` : 'none'
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#0052CC', fontSize: '0.875rem' }}>
                              {(member.name || member.user?.username || member.email || 'U')[0].toUpperCase()}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                                {member.name || member.user?.username || 'Unknown'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C' }}>
                                {member.email || member.user?.email || '—'}
                              </Typography>
                            }
                          />
                          <Chip 
                            label={member.role || 'MEMBER'} 
                            size="small" 
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: member.role === 'ADMIN' ? '#0052CC' : member.role === 'MANAGER' ? '#FF991F' : '#6554C0',
                              color: 'white',
                              fontWeight: 500
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            ) : (
              <>
                <Typography variant="h6" fontWeight="500" gutterBottom sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D', mb: 2 }}>
                  Issue Types
                </Typography>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={issueTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#3D444D' : '#EBECF0'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#9FADBC' : '#6B778C'} />
                    <YAxis stroke={isDarkMode ? '#9FADBC' : '#6B778C'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#22272B' : '#FFFFFF',
                        border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                        borderRadius: '3px'
                      }}
                    />
                    <Bar dataKey="count" fill="#0052CC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <Box sx={{ mt: 2 }}>
                  {issueTypeData.map((item, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < issueTypeData.length - 1 ? `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}` : 'none'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#5E6C84' }}>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={item.count} 
                        size="small" 
                        sx={{ 
                          bgcolor: isDarkMode ? '#22272B' : '#EBECF0',
                          color: isDarkMode ? '#B6C2CF' : '#172B4D',
                          height: 22,
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawer.open}
        onClose={() => setDetailDrawer({ open: false, type: null, data: null })}
        PaperProps={{ 
          sx: { 
            width: isMobile ? '100%' : 420, 
            p: 3,
            bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF',
            borderLeft: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`
          } 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
            {detailDrawer.type === 'projects' && `${isAdmin ? 'All' : 'My'} Projects`}
            {detailDrawer.type === 'team' && 'Team Members'}
            {detailDrawer.type === 'sprints' && (activeSprintsCount > 0 ? 'Active Sprints' : 'All Sprints')}
            {detailDrawer.type === 'overdue' && 'Overdue Issues'}
            {detailDrawer.type === 'my-tasks' && 'My Tasks'}
          </Typography>
          <IconButton 
            onClick={() => setDetailDrawer({ open: false, type: null, data: null })}
            size="small"
            sx={{ bgcolor: isDarkMode ? '#22272B' : '#EBECF0' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {!detailDrawer.data || detailDrawer.data.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '3px' }}>
            No {detailDrawer.type} found
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {/* Projects */}
            {detailDrawer.type === 'projects' && detailDrawer.data?.map((project, index) => (
              <ListItem 
                key={project.id} 
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  mb: 2, 
                  p: 2, 
                  bgcolor: isDarkMode ? '#22272B' : '#FAFBFC', 
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#2C333A' : '#F4F5F7',
                    borderColor: '#0052CC'
                  }
                }}
                onClick={() => {
                  dispatch(setCurrentProject(project));
                  navigate(`/projects/${project.id}`);
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, width: '100%' }}>
                  <Avatar sx={{ bgcolor: '#0052CC', width: 32, height: 32 }}>
                    <ProjectIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                    {project.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C', mb: 1 }}>
                  Key: <strong>{project.key}</strong>
                  </Typography>
                
                {project.description && (
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C', mb: 1 }}>
                    {project.description}
                  </Typography>
                )}
                
                <Chip 
                  label={project.status || 'ACTIVE'} 
                  size="small" 
                  sx={{ 
                    bgcolor: project.status === 'ACTIVE' ? '#36B37E' : '#6B778C',
                    color: 'white',
                    height: 22,
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }} 
                />
              </ListItem>
            ))}

            {/* Team Members */}
            {detailDrawer.type === 'team' && detailDrawer.data?.map((member, index) => (
              <ListItem 
                key={member.id || member.email} 
                sx={{ 
                  mb: 1,
                  p: 2,
                  bgcolor: isDarkMode ? '#22272B' : '#FAFBFC',
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`
                }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Avatar sx={{ bgcolor: '#0052CC', width: 36, height: 36 }}>
                    {(member.name || member.email || 'U')[0].toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                      {member.name || member.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C' }}>
                      {member.email} • {member.role}
                    </Typography>
                  }
                />
              </ListItem>
            ))}

            {/* Sprints */}
            {detailDrawer.type === 'sprints' && detailDrawer.data?.map((sprint, index) => (
              <ListItem 
                key={sprint.id} 
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  mb: 2, 
                  p: 2, 
                  bgcolor: isDarkMode ? '#22272B' : '#FAFBFC', 
                  borderRadius: '3px',
                  border: `1px solid ${isDarkMode ? '#3D444D' : '#DFE1E6'}`,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#2C333A' : '#F4F5F7',
                    borderColor: sprint.status?.toUpperCase() === 'ACTIVE' ? '#36B37E' : '#6B778C'
                  }
                }}
                onClick={() => navigate(`/sprints/${sprint.id}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: sprint.status?.toUpperCase() === 'ACTIVE' ? '#36B37E' : '#6B778C',
                      width: 32,
                      height: 32
                    }}
                  >
                    <SprintIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                    {sprint.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon fontSize="small" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C' }} />
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9FADBC' : '#6B778C' }}>
                    {sprint.start_date} — {sprint.end_date}
                  </Typography>
                </Box>
                
                <Chip 
                  label={sprint.status} 
                  size="small" 
                  sx={{ 
                    bgcolor: sprint.status?.toUpperCase() === 'ACTIVE' ? '#36B37E' : '#6B778C',
                    color: 'white',
                    height: 22,
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }} 
                />
              </ListItem>
            ))}

            {/* Overdue Issues & My Tasks */}
            {(detailDrawer.type === 'overdue' || detailDrawer.type === 'my-tasks') && detailDrawer.data?.map((issue, index) => (
              <ListItem 
                key={issue.id} 
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  mb: 2, 
                  p: 2, 
                  borderLeft: detailDrawer.type === 'overdue' ? '4px solid #DE350B' : `3px solid ${getPriorityColor(issue.priority)}`, 
                  bgcolor: isDarkMode ? '#22272B' : '#FAFBFC', 
                  borderRadius: '3px',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  '&:hover': {
                    bgcolor: isDarkMode ? '#2C333A' : '#F4F5F7',
                  }
                }}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 0.5, color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                  {issue.title || issue.issue_key}
                </Typography>
                
                {issue.due_date && (
                  <Typography variant="body2" sx={{ color: detailDrawer.type === 'overdue' ? '#DE350B' : (isDarkMode ? '#9FADBC' : '#6B778C'), mb: 1 }}>
                    Due: {issue.due_date}
                  </Typography>
                )}
                
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={issue.priority} 
                    size="small" 
                    sx={{ 
                      bgcolor: getPriorityColor(issue.priority), 
                      color: 'white',
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }} 
                  />
                  <Chip 
                    label={issue.status} 
                    size="small" 
                    sx={{
                      bgcolor: getStatusColor(issue.status),
                      color: 'white',
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  />
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>

      {/* Create Project Modal */}
      <Dialog 
        open={openProjectModal} 
        onClose={() => setOpenProjectModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '3px',
            bgcolor: isDarkMode ? '#22272B' : '#FFFFFF'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
              Create New Project
            </Typography>
            <IconButton 
              onClick={() => setOpenProjectModal(false)} 
              size="small"
              sx={{ bgcolor: isDarkMode ? '#1D2125' : '#EBECF0' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Project Name"
            name="name"
            value={projectForm.name}
            onChange={handleProjectChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Project Key"
            name="key"
            value={projectForm.key}
            onChange={handleProjectChange}
            fullWidth
            required
            helperText="Short identifier (e.g., DEV, PROJ)"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={projectForm.description}
            onChange={handleProjectChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={projectForm.start_date}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                value={projectForm.end_date}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}`, p: 2 }}>
          <Button 
            onClick={() => setOpenProjectModal(false)}
            sx={{ textTransform: 'none', color: isDarkMode ? '#9FADBC' : '#42526E' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateProject} 
            disabled={!orgId || !projectForm.name || !projectForm.key}
            sx={{ 
              textTransform: 'none',
              bgcolor: '#0052CC',
              '&:hover': { bgcolor: '#0747A6' }
            }}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

     {/* Add Member Modal */}
<Dialog 
  open={openMemberModal} 
  onClose={() => setOpenMemberModal(false)} 
  maxWidth="sm" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: '3px',
      bgcolor: isDarkMode ? '#22272B' : '#FFFFFF'
    }
  }}
>
  <DialogTitle sx={{ borderBottom: `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}` }}>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
        Add Team Member
      </Typography>
      <IconButton 
        onClick={() => setOpenMemberModal(false)} 
        size="small"
        sx={{ bgcolor: isDarkMode ? '#1D2125' : '#EBECF0' }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  </DialogTitle>
  
  <DialogContent sx={{ pt: 3 }}>
    <TextField
      label="Full Name"
      name="name"
      value={memberForm.name}
      onChange={handleMemberChange}
      fullWidth
      required
      placeholder="e.g., John Doe"
      sx={{ mb: 2 }}
    />
    
    <TextField
      label="Email Address"
      name="email"
      type="email"
      value={memberForm.email}
      onChange={handleMemberChange}
      fullWidth
      required
      placeholder="john@example.com"
      helperText="This will be used for login"
      sx={{ mb: 2 }}
    />
    
    {/* ✅ NEW: Password Field */}
    <TextField
      label="Initial Password"
      name="password"
      type="password"
      value={memberForm.password}
      onChange={handleMemberChange}
      fullWidth
      required
      placeholder="Minimum 8 characters"
      helperText="Set a secure password for this member to login"
      sx={{ mb: 2 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              onClick={() => {
                // Generate random password
                const randomPass = Math.random().toString(36).slice(-10) + 
                                   Math.random().toString(36).slice(-10).toUpperCase() + 
                                   '!@#'[Math.floor(Math.random() * 3)];
                setMemberForm({ ...memberForm, password: randomPass });
              }}
              size="small"
              title="Generate random password"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
    
    <TextField
      select
      label="Role"
      name="role"
      value={memberForm.role}
      onChange={handleMemberChange}
      fullWidth
      required
      helperText="Select member's role in the organization"
    >
      <MenuItem value="MANAGER">Manager</MenuItem>
      <MenuItem value="MEMBER">Member</MenuItem>
    </TextField>
    
    {/* ✅ Password Preview */}
    {memberForm.password && (
      <Alert severity="info" sx={{ mt: 2, borderRadius: '3px' }}>
        <Typography variant="body2" fontWeight="500">
          Password Preview:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
          {memberForm.password}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Make sure to share this password securely with the new member
        </Typography>
      </Alert>
    )}
  </DialogContent>
  
  <DialogActions sx={{ borderTop: `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}`, p: 2 }}>
    <Button 
      onClick={() => {
        setOpenMemberModal(false);
        setMemberForm({ name: '', email: '', role: 'MEMBER', password: '' });
      }}
      sx={{ textTransform: 'none', color: isDarkMode ? '#9FADBC' : '#42526E' }}
    >
      Cancel
    </Button>
    <Button 
      variant="contained" 
      onClick={handleCreateMember} 
      disabled={!orgId || !memberForm.name || !memberForm.email || !memberForm.password}
      sx={{ 
        textTransform: 'none',
        bgcolor: '#0052CC',
        '&:hover': { bgcolor: '#0747A6' }
      }}
    >
      Add Member
    </Button>
  </DialogActions>
</Dialog>
{/* ✅ NEW: Credentials Dialog */}
      <Dialog
        open={credentialsDialog.open}
        onClose={() => setCredentialsDialog({ open: false, email: '', password: '', name: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '3px',
            bgcolor: isDarkMode ? '#22272B' : '#FFFFFF'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}` }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#36B37E' }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="500" sx={{ color: isDarkMode ? '#B6C2CF' : '#172B4D' }}>
                Member Created Successfully!
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {credentialsDialog.name} has been added to your organization
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '3px' }}>
            <Typography variant="body2" fontWeight="500" gutterBottom>
              ⚠️ Important: Save these credentials
            </Typography>
            <Typography variant="caption">
              Share these credentials securely with the new member. They won't be shown again.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, bgcolor: isDarkMode ? '#1D2125' : '#F4F5F7', borderRadius: '3px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Email (Login Username)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="body1" fontWeight="500" sx={{ fontFamily: 'monospace' }}>
                    {credentialsDialog.email}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(credentialsDialog.email);
                      setSnackMsg('✅ Email copied to clipboard');
                      setSnackOpen(true);
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Password
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="body1" fontWeight="500" sx={{ fontFamily: 'monospace' }}>
                    {credentialsDialog.password}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(credentialsDialog.password);
                      setSnackMsg('✅ Password copied to clipboard');
                      setSnackOpen(true);
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    const text = `Login Credentials for ${credentialsDialog.name}\n\nEmail: ${credentialsDialog.email}\nPassword: ${credentialsDialog.password}\n\nPlease change your password after first login.`;
                    navigator.clipboard.writeText(text);
                    setSnackMsg('✅ Full credentials copied to clipboard');
                    setSnackOpen(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Copy All Credentials
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ borderTop: `1px solid ${isDarkMode ? '#3D444D' : '#EBECF0'}`, p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setCredentialsDialog({ open: false, email: '', password: '', name: '' })}
            sx={{ 
              textTransform: 'none',
              bgcolor: '#0052CC',
              '&:hover': { bgcolor: '#0747A6' }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;