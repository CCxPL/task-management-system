// Organization type constants
export const ORGANIZATION_TYPES = {
    SCHOOL: 'SCHOOL',
    INSTITUTE: 'INSTITUTE',
    COMPANY: 'COMPANY'
};

// Get display names based on organization type
export const getRoleDisplayName = (role, orgType = 'COMPANY') => {
    const roleMap = {
        'SCHOOL': {
            'SUPER_ADMIN': 'Super Admin',
            'ORG_ADMIN': 'Mentor',
            'MANAGER': 'Senior Mentor',
            'MEMBER': 'Student',
            'STUDENT': 'Student'
        },
        'INSTITUTE': {
            'SUPER_ADMIN': 'Super Admin',
            'ORG_ADMIN': 'Admin',
            'MANAGER': 'Manager',
            'MEMBER': 'Member',
            'STUDENT': 'Student'
        },
        'COMPANY': {
            'SUPER_ADMIN': 'Super Admin',
            'ORG_ADMIN': 'Admin',
            'MANAGER': 'Manager',
            'MEMBER': 'Employee'
        }
    };

    return roleMap[orgType]?.[role] || role;
};

// Get member label based on organization type
export const getMemberLabel = (orgType = 'COMPANY') => {
    const labelMap = {
        'SCHOOL': 'Student',
        'INSTITUTE': 'Member',
        'COMPANY': 'Employee'
    };
    return labelMap[orgType] || 'Member';
};

// Get team label based on organization type
export const getTeamLabel = (orgType = 'COMPANY') => {
    const labelMap = {
        'SCHOOL': 'Students',
        'INSTITUTE': 'Members',
        'COMPANY': 'Team Members'
    };
    return labelMap[orgType] || 'Team Members';
};

// Get welcome message based on organization type
export const getWelcomeTitle = (user) => {
    if (!user) return 'Welcome';

    const { role, organization_type: orgType } = user;
    const roleDisplay = getRoleDisplayName(role, orgType);

    return `Welcome, ${roleDisplay}`;
};

// Get menu items based on role
export const getMenuItems = (user) => {
    const baseItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];

    if (!user) return baseItems;

    const { role, organization_type: orgType } = user;

    // SUPER_ADMIN menu - ADD CREATE ADMIN OPTION
    if (role === 'SUPER_ADMIN') {
        return [
            ...baseItems,
            { path: '/super-admin/organizations', label: 'Organizations', icon: 'business' },
            { path: '/super-admin/create-admin', label: 'Create Admin', icon: 'person_add' },
            { path: '/super-admin/manage-admins', label: 'Manage Admins', icon: 'admin_panel_settings' },
        ];
    }

    // ORG_ADMIN menu
    if (role === 'ORG_ADMIN') {
        const memberLabel = getTeamLabel(orgType);
        return [
            ...baseItems,
            { path: '/projects', label: 'Projects', icon: 'folder' },
            { path: '/team', label: memberLabel, icon: 'group' },
            { path: '/reports', label: 'Reports', icon: 'analytics' },
        ];
    }

    // MANAGER menu (Company) / TEACHER menu (Institute/School)
    if (role === 'MANAGER') {
        return [
            ...baseItems,
            { path: '/projects', label: 'Projects', icon: 'folder' },
            { path: '/sprints', label: 'Sprints', icon: 'rocket' },
            { path: '/kanban', label: 'Kanban Board', icon: 'view_kanban' },
        ];
    }

    // MEMBER/STUDENT menu
    return [
        ...baseItems,
        { path: '/my-tasks', label: orgType === 'SCHOOL' ? 'My Assignments' : 'My Tasks', icon: 'task' },
        { path: '/kanban', label: 'Board', icon: 'view_kanban' },
    ];
};

// Check permissions
export const hasPermission = (user, requiredRole) => {
    const hierarchy = {
        'SUPER_ADMIN': 5,
        'ORG_ADMIN': 4,
        'MANAGER': 3,
        'MEMBER': 2,
        'STUDENT': 1
    };

    return hierarchy[user?.role] >= hierarchy[requiredRole];
};

// Check if user can create admin (only SUPER_ADMIN)
export const canCreateAdmin = (user) => {
    return user?.role === 'SUPER_ADMIN';
};

// Check if user can manage organization
export const canManageOrganization = (user) => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN';
};

// Get organization status for admin
export const getAdminStatusFromOrg = (organization) => {
    if (!organization) return 'ACTIVE';
    return organization.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
};