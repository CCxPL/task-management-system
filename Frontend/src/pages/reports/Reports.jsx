import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import { reportsAPI } from '../../api/reports.api.js';
import Loader from '../../components/common/Loader.jsx';

const Reports = () => {
    const { list: projects } = useSelector((state) => state.projects);
    const { user } = useSelector((state) => state.auth);
    const [selectedProject, setSelectedProject] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].id);
        }
    }, [projects]);

    useEffect(() => {
        if (selectedProject) {
            fetchReportData();
        }
    }, [selectedProject]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const data = await reportsAPI.getProjectReport(selectedProject);
            setReportData(data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for charts (would come from API in real app)
    const sprintBurndownData = [
        { day: 'Day 1', ideal: 100, actual: 100 },
        { day: 'Day 2', ideal: 85, actual: 90 },
        { day: 'Day 3', ideal: 70, actual: 75 },
        { day: 'Day 4', ideal: 55, actual: 65 },
        { day: 'Day 5', ideal: 40, actual: 50 },
        { day: 'Day 6', ideal: 25, actual: 35 },
        { day: 'Day 7', ideal: 10, actual: 15 },
    ];

    const taskStatusData = [
        { name: 'To Do', value: reportData?.total_tasks ? Math.floor(reportData.total_tasks * 0.3) : 12 },
        { name: 'In Progress', value: reportData?.total_tasks ? Math.floor(reportData.total_tasks * 0.4) : 16 },
        { name: 'Review', value: reportData?.total_tasks ? Math.floor(reportData.total_tasks * 0.2) : 8 },
        { name: 'Done', value: reportData?.completed || 18 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) return <Loader />;

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Reports Dashboard
                </Typography>
                <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Select Project</InputLabel>
                    <Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
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

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'primary.light',
                        color: 'white',
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h3">{reportData?.total_tasks || 0}</Typography>
                        <Typography>Total Tasks</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'success.light',
                        color: 'white',
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h3">{reportData?.completed || 0}</Typography>
                        <Typography>Completed</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'warning.light',
                        color: 'white',
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h3">{reportData?.in_progress || 0}</Typography>
                        <Typography>In Progress</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'error.light',
                        color: 'white',
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h3">{reportData?.overdue || 0}</Typography>
                        <Typography>Overdue</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Sprint Burndown Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Sprint Burndown Chart
                        </Typography>
                        <LineChart width={500} height={300} data={sprintBurndownData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#00000033" />
                            <XAxis dataKey="day" stroke="#00000099" />
                            <YAxis stroke="#00000099" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="ideal" stroke="#8884d8" strokeDasharray="5 5" strokeWidth={2} />
                            <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </Paper>
                </Grid>

                {/* Task Status Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Task Status Distribution
                        </Typography>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={taskStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="#000"
                                strokeWidth={1}
                            >
                                {taskStatusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#000"
                                        strokeWidth={1}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </Paper>
                </Grid>

                {/* Project Progress */}
                <Grid item xs={12}>
                    <Paper sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: '#00000066',
                        borderRadius: 1,
                    }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Project Progress Report
                        </Typography>
                        <Typography color="textSecondary" paragraph>
                            Project-wise progress and sprint completion rates.
                        </Typography>
                        {/* Additional project progress charts would go here */}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Reports;