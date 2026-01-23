import React from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    Security as SecurityIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return (
            <Box textAlign="center" py={5}>
                <Typography>Please login to view profile</Typography>
            </Box>
        );
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'MANAGER': return 'warning';
            case 'MEMBER': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                {/* Left Column - Basic Info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                fontSize: 48,
                                bgcolor: 'primary.main',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            {user.username?.charAt(0).toUpperCase()}
                        </Avatar>

                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {user.username}
                        </Typography>

                        <Chip
                            label={user.role}
                            color={getRoleColor(user.role)}
                            sx={{ mb: 2 }}
                        />

                        <Typography color="textSecondary" paragraph>
                            {user.email}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Right Column - Details */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Account Information
                        </Typography>

                        <List>
                            <ListItem>
                                <PersonIcon color="primary" sx={{ mr: 2 }} />
                                <ListItemText
                                    primary="Username"
                                    secondary={user.username}
                                />
                            </ListItem>
                            <Divider />

                            <ListItem>
                                <EmailIcon color="primary" sx={{ mr: 2 }} />
                                <ListItemText
                                    primary="Email"
                                    secondary={user.email}
                                />
                            </ListItem>
                            <Divider />

                            <ListItem>
    <SecurityIcon color="primary" sx={{ mr: 2 }} />
    <ListItemText
        primary="Role"
        secondary={
            <Typography component="div">
                <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                />
            </Typography>
        }
    />
</ListItem>

                            <Divider />

                            {user.organization && (
                                <>
                                    <ListItem>
                                        <BusinessIcon color="primary" sx={{ mr: 2 }} />
                                        <ListItemText
                                            primary="Organization"
                                            secondary={user.organization.name}
                                        />
                                    </ListItem>
                                    <Divider />
                                </>
                            )}

                            <ListItem>
                                <CalendarIcon color="primary" sx={{ mr: 2 }} />
                                <ListItemText
                                    primary="Member Since"
                                    secondary={
                                        user.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : 'Unknown'
                                    }
                                />
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Additional Info */}
                    <Paper sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Permissions Summary
                        </Typography>
                        <Typography color="textSecondary" paragraph>
                            Based on your role ({user.role}), you can:
                        </Typography>

                        <Grid container spacing={2}>
                            {user.role === 'ADMIN' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Create/Edit Projects" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Manage Users" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="View All Reports" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Full System Access" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                </>
                            )}

                            {user.role === 'MANAGER' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Create/Edit Projects" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Manage Sprints" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Assign Tasks" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="View Reports" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                </>
                            )}

                            {user.role === 'MEMBER' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="View Assigned Tasks" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Update Task Status" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Log Time" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Chip label="Add Comments" color="success" variant="outlined" sx={{ m: 0.5 }} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;