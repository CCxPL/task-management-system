import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    useTheme,
    Avatar,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Divider,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    Group as GroupIcon,
    BugReport as BugIcon,
    Task as TaskIcon,
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const Reports = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const { currentProject } = useSelector((state) => state.projectContext);
    const { list: projects } = useSelector((state) => state.projects);
    
    const [selectedProject, setSelectedProject] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentProject) {
            setSelectedProject(currentProject);
        }
    }, [currentProject]);

    useEffect(() => {
        if (selectedProject?.id) {
            fetchReportData(selectedProject.id);
        }
    }, [selectedProject]);

    const fetchReportData = async (projectId) => {
        try {
            setLoading(true);
            console.log('📥 Fetching report for project:', projectId);
            
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reports/project/?project=${projectId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Report data received:', data);
            setReportData(data);
        } catch (error) {
            console.error('❌ Error fetching report data:', error);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Loading reports...</Typography>
                <LinearProgress />
            </Box>
        );
    }

    if (!selectedProject) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', mt: 10 }}>
                <AssessmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="textSecondary" gutterBottom>
                    No Project Selected
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Please select a project to view reports
                </Typography>
            </Box>
        );
    }

    if (!reportData) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', mt: 10 }}>
                <WarningIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                <Typography variant="h5" color="textSecondary">
                    No Data Available
                </Typography>
            </Box>
        );
    }

    const { overall_stats, status_breakdown, priority_breakdown, type_breakdown, team_performance } = reportData;

    // Chart colors
    const COLORS = {
        blue: '#3B82F6',
        green: '#10B981',
        yellow: '#F59E0B',
        red: '#EF4444',
        purple: '#8B5CF6',
        cyan: '#06B6D4',
        pink: '#EC4899',
    };

    // Status chart data
    const statusChartData = [
        { name: 'Backlog', value: status_breakdown?.BACKLOG || 0, color: COLORS.blue },
        { name: 'To Do', value: status_breakdown?.TO_DO || 0, color: COLORS.cyan },
        { name: 'In Progress', value: status_breakdown?.IN_PROGRESS || 0, color: COLORS.yellow },
        { name: 'Review', value: status_breakdown?.REVIEW || 0, color: COLORS.purple },
        { name: 'Done', value: status_breakdown?.DONE || 0, color: COLORS.green },
    ].filter(item => item.value > 0);

    // Priority chart data
    const priorityChartData = [
        { name: 'Low', value: priority_breakdown?.LOW || 0, color: COLORS.green },
        { name: 'Medium', value: priority_breakdown?.MEDIUM || 0, color: COLORS.yellow },
        { name: 'High', value: priority_breakdown?.HIGH || 0, color: COLORS.red },
        { name: 'Critical', value: priority_breakdown?.CRITICAL || 0, color: COLORS.purple },
    ].filter(item => item.value > 0);

    // Type chart data
    const typeChartData = [
        { name: 'Task', value: type_breakdown?.TASK || 0, color: COLORS.blue },
        { name: 'Bug', value: type_breakdown?.BUG || 0, color: COLORS.red },
        { name: 'Story', value: type_breakdown?.STORY || 0, color: COLORS.green },
        { name: 'Epic', value: type_breakdown?.EPIC || 0, color: COLORS.purple },
    ].filter(item => item.value > 0);

    // Custom label for pie charts
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null; // Hide labels for small slices
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Box sx={{ 
            p: 3, 
            bgcolor: isDarkMode ? '#161A1D' : '#F4F5F7', 
            minHeight: '100vh' 
        }}>
            {/* Header */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4 
            }}>
                <Box>
                    <Typography 
                        variant="h4" 
                        fontWeight="700" 
                        sx={{ 
                            background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}
                    >
                        📊 Analytics Dashboard
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Comprehensive project insights and metrics
                    </Typography>
                </Box>
                
                <FormControl 
                    sx={{ 
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                        }
                    }}
                >
                    <InputLabel>Select Project</InputLabel>
                    <Select
                        value={selectedProject?.id || ''}
                        onChange={(e) => {
                            const project = projects.find(p => p.id === e.target.value);
                            setSelectedProject(project);
                        }}
                        label="Select Project"
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                {project.name} ({project.key})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Tasks */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            background: `linear-gradient(135deg, ${COLORS.blue} 0%, #2563EB 100%)`,
                            color: 'white',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}
                    >
                        <CardContent>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Total Tasks
                                    </Typography>
                                    <TaskIcon />
                                </Box>
                                <Typography variant="h3" fontWeight="700">
                                    {overall_stats?.total_issues || 0}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUpIcon fontSize="small" />
                                    <Typography variant="caption">
                                        All issues in project
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Completed */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            background: `linear-gradient(135deg, ${COLORS.green} 0%, #059669 100%)`,
                            color: 'white',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}
                    >
                        <CardContent>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Completed
                                    </Typography>
                                    <CheckCircleIcon />
                                </Box>
                                <Typography variant="h3" fontWeight="700">
                                    {overall_stats?.completed_issues || 0}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption">
                                        {overall_stats?.completion_rate || 0}% completion rate
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* In Progress */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            background: `linear-gradient(135deg, ${COLORS.yellow} 0%, #D97706 100%)`,
                            color: 'white',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}
                    >
                        <CardContent>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        In Progress
                                    </Typography>
                                    <ScheduleIcon />
                                </Box>
                                <Typography variant="h3" fontWeight="700">
                                    {status_breakdown?.IN_PROGRESS || 0}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption">
                                        Active tasks
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Issues */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            background: `linear-gradient(135deg, ${COLORS.purple} 0%, #7C3AED 100%)`,
                            color: 'white',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)',
                            }
                        }}
                    >
                        <CardContent>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Active Issues
                                    </Typography>
                                    <TimelineIcon />
                                </Box>
                                <Typography variant="h3" fontWeight="700">
                                    {overall_stats?.active_issues || 0}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption">
                                        Pending work
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Status Distribution */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            borderRadius: '16px',
                            height: '100%',
                            bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF'
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimelineIcon color="primary" />
                            Status Distribution
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="textSecondary">No data available</Typography>
                            </Box>
                        )}
                        
                        {/* Legend */}
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            {statusChartData.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: item.color }} />
                                        <Typography variant="body2">{item.name}</Typography>
                                    </Box>
                                    <Chip label={item.value} size="small" />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Priority Breakdown */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            borderRadius: '16px',
                            height: '100%',
                            bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF'
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningIcon color="warning" />
                            Priority Breakdown
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {priorityChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={priorityChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {priorityChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="textSecondary">No data available</Typography>
                            </Box>
                        )}
                        
                        {/* Legend */}
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            {priorityChartData.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: item.color }} />
                                        <Typography variant="body2">{item.name}</Typography>
                                    </Box>
                                    <Chip label={item.value} size="small" />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Type Distribution */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        sx={{ 
                            p: 3, 
                            borderRadius: '16px',
                            height: '100%',
                            bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF'
                        }}
                    >
                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BugIcon color="error" />
                            Issue Types
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        
                        {typeChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={typeChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {typeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography color="textSecondary">No data available</Typography>
                            </Box>
                        )}
                        
                        {/* Legend */}
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            {typeChartData.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: item.color }} />
                                        <Typography variant="body2">{item.name}</Typography>
                                    </Box>
                                    <Chip label={item.value} size="small" />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Team Performance */}
            {team_performance && team_performance.length > 0 && (
                <Paper 
                    sx={{ 
                        p: 3, 
                        borderRadius: '16px',
                        bgcolor: isDarkMode ? '#1D2125' : '#FFFFFF'
                    }}
                >
                    <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" />
                        Team Performance
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Member</strong></TableCell>
                                    <TableCell align="center"><strong>Role</strong></TableCell>
                                    <TableCell align="center"><strong>Total</strong></TableCell>
                                    <TableCell align="center"><strong>Completed</strong></TableCell>
                                    <TableCell align="center"><strong>In Progress</strong></TableCell>
                                    <TableCell align="right"><strong>Completion Rate</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {team_performance.map((member) => (
                                    <TableRow key={member.member_id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                    {member.member_name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight="500">
                                                    {member.member_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={member.role} 
                                                size="small" 
                                                color={member.role === 'ADMIN' ? 'error' : member.role === 'MANAGER' ? 'warning' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={member.total_issues} color="primary" size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={member.completed} color="success" size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={member.in_progress} color="warning" size="small" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={member.completion_rate} 
                                                    sx={{ width: 100, height: 8, borderRadius: 4 }}
                                                    color={member.completion_rate > 70 ? 'success' : member.completion_rate > 40 ? 'warning' : 'error'}
                                                />
                                                <Typography variant="body2" fontWeight="600">
                                                    {member.completion_rate}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default Reports;
