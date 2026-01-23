import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DarkModeToggle from '../components/common/DarkModeToggle.jsx';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Badge,
    useTheme,
    useMediaQuery,
    Button, // ADD THIS IMPORT
    Chip, // ADD THIS IMPORT
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Folder,
    ViewKanban,
    FormatListBulleted,
    Assessment,
    Person,
    Notifications,
    Logout,
    Business, // ADD THIS IMPORT
    PersonAdd, // ADD THIS IMPORT
    AdminPanelSettings, // ADD THIS IMPORT
} from '@mui/icons-material';
import { logout } from '../app/slices/authSlice.js';
import {
    getMenuItems,
    getWelcomeTitle,
    getRoleDisplayName,
    getAdminStatusFromOrg,
    canCreateAdmin
} from '../utils/roleHelpers.js'; // ADD THIS IMPORT

const drawerWidth = 240;

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Get theme for dark mode
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Dark mode colors
    const sidebarBg = isDarkMode ? '#1D2125' : '#FAFBFC';
    const sidebarBorder = isDarkMode ? '#3D444D' : '#A5ADBA';
    const appBarBg = isDarkMode ? '#1D2125' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#172B4D';
    const dividerColor = isDarkMode ? '#3D444D' : '#A5ADBA';
    const listItemHover = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 82, 204, 0.08)';

    // Get dynamic menu items from roleHelpers
    const menuItems = getMenuItems(user);

    // Get organization info
    const orgName = user?.organization?.name || 'Organization';
    const orgType = user?.organization?.type || 'COMPANY';
    const orgStatus = user?.organization?.status || 'ACTIVE';
    const adminStatus = getAdminStatusFromOrg(user?.organization);

    // Get welcome title
    const welcomeTitle = getWelcomeTitle(user);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Handle Create Admin button click (for SUPER_ADMIN)
    const handleCreateAdmin = () => {
        navigate('/super-admin/create-admin');
    };

    // Handle Manage Organizations click (for SUPER_ADMIN)
    const handleManageOrganizations = () => {
        navigate('/super-admin/organizations');
    };

    const drawer = (
        <Box sx={{ height: '100%' }}>
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{
                        color: isDarkMode ? '#FFFFFF' : 'primary.main',
                        fontWeight: 'bold',
                    }}
                >
                    TaskFlow
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: dividerColor }} />

            {/* Organization Info - Show for ORG_ADMIN */}
            {user?.role === 'ORG_ADMIN' && (
                <Box sx={{ p: 2, borderBottom: `1px solid ${dividerColor}` }}>
                    <Typography variant="subtitle2" sx={{ color: textColor, fontWeight: 'bold' }}>
                        {orgName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                            label={orgType}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                borderColor: isDarkMode ? '#579DFF' : 'primary.main',
                                color: isDarkMode ? '#579DFF' : 'primary.main'
                            }}
                        />
                        <Chip
                            label={orgStatus}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                borderColor: orgStatus === 'ACTIVE' ? '#36B37E' : '#FF5630',
                                color: orgStatus === 'ACTIVE' ? '#36B37E' : '#FF5630'
                            }}
                        />
                    </Box>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#B6C2CF' : '#6B778C', mt: 1, display: 'block' }}>
                        Admin Status: {adminStatus}
                    </Typography>
                </Box>
            )}

            {/* SUPER_ADMIN Organization Actions */}
            {user?.role === 'SUPER_ADMIN' && (
                <Box sx={{ p: 2, borderBottom: `1px solid ${dividerColor}` }}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PersonAdd />}
                        onClick={handleCreateAdmin}
                        size="small"
                        sx={{ mb: 1 }}
                    >
                        Create Admin
                    </Button>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Business />}
                        onClick={handleManageOrganizations}
                        size="small"
                    >
                        Organizations
                    </Button>
                </Box>
            )}

            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.label || item.text}
                        disablePadding
                        sx={{
                            borderBottom: `1px solid ${isDarkMode ? '#3D444D' : '#E3E5E8'}`,
                            '&:last-child': { borderBottom: 'none' }
                        }}
                    >
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={{
                                '&:hover': {
                                    backgroundColor: listItemHover,
                                    borderLeft: '3px solid #0052CC',
                                },
                                py: 1.5,
                            }}
                        >
                            <ListItemIcon sx={{
                                color: isDarkMode ? '#B6C2CF' : 'primary.main',
                                minWidth: 40,
                            }}>
                                {item.icon === 'dashboard' && <Dashboard />}
                                {item.icon === 'person' && <Person />}
                                {item.icon === 'folder' && <Folder />}
                                {item.icon === 'view_kanban' && <ViewKanban />}
                                {item.icon === 'analytics' && <Assessment />}
                                {item.icon === 'business' && <Business />}
                                {item.icon === 'person_add' && <PersonAdd />}
                                {item.icon === 'admin_panel_settings' && <AdminPanelSettings />}
                                {item.icon === 'rocket' && <FormatListBulleted />}
                                {item.icon === 'task' && <ViewKanban />}
                                {item.icon === 'group' && <Person />}
                                {/* Add more icon mappings as needed */}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label || item.text}
                                primaryTypographyProps={{
                                    fontWeight: 500,
                                    color: isDarkMode ? '#FFFFFF' : 'inherit',
                                    fontSize: '0.95rem',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    borderBottom: `2px solid ${sidebarBorder}`,
                    backgroundColor: appBarBg,
                    color: textColor,
                    boxShadow: isDarkMode
                        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: { sm: 'none' },
                            color: textColor
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Welcome Message with Organization Name */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap sx={{ color: textColor }}>
                            {welcomeTitle}
                        </Typography>
                        {user?.organization?.name && (
                            <Typography variant="caption" sx={{
                                color: isDarkMode ? '#B6C2CF' : '#6B778C',
                                display: 'block'
                            }}>
                                {user.organization.name}
                                {user.organization.type === 'SCHOOL' && ' School'}
                                {user.organization.type === 'INSTITUTE' && ' Institute'}
                                {user.organization.type === 'COMPANY' && ' Company'}
                            </Typography>
                        )}
                    </Box>

                    {/* Organization Status Chip (for ORG_ADMIN) */}
                    {user?.role === 'ORG_ADMIN' && (
                        <Chip
                            label={`${orgStatus} - ${adminStatus}`}
                            size="small"
                            variant="outlined"
                            sx={{
                                mr: 2,
                                borderColor: orgStatus === 'ACTIVE' ? '#36B37E' : '#FF5630',
                                color: orgStatus === 'ACTIVE' ? '#36B37E' : '#FF5630',
                                fontSize: '0.75rem'
                            }}
                        />
                    )}

                    {/* Notifications */}
                    <IconButton sx={{ color: textColor }}>
                        <Badge badgeContent={3} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>

                    <DarkModeToggle />

                    {/* User Menu */}
                    <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
                        <Avatar sx={{
                            bgcolor: isDarkMode ? '#579DFF' : 'primary.main',
                            width: 36,
                            height: 36
                        }}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                border: `1px solid ${sidebarBorder}`,
                                backgroundColor: isDarkMode ? '#1D2125' : '#FFFFFF',
                                color: textColor,
                                boxShadow: isDarkMode
                                    ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                '& .MuiMenuItem-root': {
                                    color: textColor,
                                    '&:hover': {
                                        backgroundColor: listItemHover,
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem onClick={() => navigate('/profile')}>
                            <ListItemIcon>
                                <Person fontSize="small" sx={{ color: textColor }} />
                            </ListItemIcon>
                            Profile
                        </MenuItem>

                        {/* Show Organization Menu for ORG_ADMIN */}
                        {user?.role === 'ORG_ADMIN' && (
                            <MenuItem onClick={() => navigate('/organization-settings')}>
                                <ListItemIcon>
                                    <Business fontSize="small" sx={{ color: textColor }} />
                                </ListItemIcon>
                                Organization Settings
                            </MenuItem>
                        )}

                        <Divider sx={{ borderColor: dividerColor }} />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" sx={{ color: textColor }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: `2px solid ${sidebarBorder}`,
                            backgroundColor: sidebarBg,
                            color: textColor,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            borderRight: `2px solid ${sidebarBorder}`,
                            backgroundColor: sidebarBg,
                            color: textColor,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    backgroundColor: isDarkMode ? '#161A1D' : '#F4F5F7',
                    minHeight: '100vh',
                    color: textColor,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;