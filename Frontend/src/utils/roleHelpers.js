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
            'ADMIN': 'Admin',
            'MANAGER': 'Senior Mentor',
            'MEMBER': 'Student',
            'STUDENT': 'Student'
        },
        'INSTITUTE': {
            'SUPER_ADMIN': 'Super Admin',
            'ORG_ADMIN': 'Admin',
            'ADMIN': 'Admin',
            'MANAGER': 'Manager',
            'MEMBER': 'Member',
            'STUDENT': 'Student'
        },
        'COMPANY': {
            'SUPER_ADMIN': 'Super Admin',
            'ORG_ADMIN': 'Admin',
            'ADMIN': 'Admin',
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
    console.log('🔍 getMenuItems called with user:', user); // ✅ Debug log
    
    if (!user) {
        console.log('❌ No user found!');
        return [
            { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
            { path: '/profile', label: 'Profile', icon: 'person' },
        ];
    }

    const { role, organization_type: orgType } = user;
    console.log('🎭 User role:', role); // ✅ Debug log

    // SUPER_ADMIN menu
    if (role === 'SUPER_ADMIN') {
        console.log('✅ Returning SUPER_ADMIN menu');
        return [
            { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
            { path: '/super-admin/organizations', label: 'Organizations', icon: 'business' },
            { path: '/super-admin/create-admin', label: 'Create Admin', icon: 'person_add' },
            { path: '/super-admin/manage-admins', label: 'Manage Admins', icon: 'admin_panel_settings' },
            { path: '/profile', label: 'Profile', icon: 'person' },
        ];
    }

    // ADMIN menu (ORG_ADMIN or ADMIN role)
    if (role === 'ORG_ADMIN' || role === 'ADMIN') {
        console.log('✅ Returning ADMIN menu');
        const memberLabel = getTeamLabel(orgType);
        return [
            { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
            { path: '/projects', label: 'Projects', icon: 'folder' },
            { path: '/board', label: 'Board', icon: 'view_kanban' },
            { path: '/sprints', label: 'Sprints', icon: 'rocket' },
            { path: '/team', label: memberLabel, icon: 'group' },
            { path: '/workflow', label: 'Workflow', icon: 'settings' }, // ✅ Workflow here
            { path: '/reports', label: 'Reports', icon: 'analytics' },
            { path: '/profile', label: 'Profile', icon: 'person' },
        ];
    }

    // MANAGER menu
    if (role === 'MANAGER') {
        console.log('✅ Returning MANAGER menu');
        return [
            { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
            { path: '/projects', label: 'Projects', icon: 'folder' },
            { path: '/board', label: 'Board', icon: 'view_kanban' },
            { path: '/sprints', label: 'Sprints', icon: 'rocket' },
            { path: '/workflow', label: 'Workflow', icon: 'settings' }, // ✅ Workflow here
            { path: '/profile', label: 'Profile', icon: 'person' },
        ];
    }

    // MEMBER/STUDENT menu
    console.log('✅ Returning MEMBER menu');
    return [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/board', label: 'Board', icon: 'view_kanban' },
        { path: '/my-tasks', label: orgType === 'SCHOOL' ? 'My Assignments' : 'My Tasks', icon: 'task' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];
};

// Check permissions
export const hasPermission = (user, requiredRole) => {
    const hierarchy = {
        'SUPER_ADMIN': 5,
        'ORG_ADMIN': 4,
        'ADMIN': 4,
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
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN' || user?.role === 'ADMIN';
};

// Get organization status for admin
export const getAdminStatusFromOrg = (organization) => {
    if (!organization) return 'ACTIVE';
    return organization.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
};