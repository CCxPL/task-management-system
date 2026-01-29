// Role-based permission utilities as per API rules and documents

export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    MEMBER: 'MEMBER',
};

// Check if user has specific role
export const hasRole = (user, role) => {
    return user?.role === role;
};

// Check if user has any of the given roles
export const hasAnyRole = (user, roles) => {
    return roles.includes(user?.role);
};

// Permission matrix as per Phase-1 System Design document
export const PERMISSIONS = {
    // Project permissions
    CREATE_PROJECT: [ROLES.ADMIN, ROLES.MANAGER],
    EDIT_PROJECT: [ROLES.ADMIN, ROLES.MANAGER],
    DELETE_PROJECT: [ROLES.ADMIN],

    // Sprint permissions
    CREATE_SPRINT: [ROLES.ADMIN, ROLES.MANAGER],
    EDIT_SPRINT: [ROLES.ADMIN, ROLES.MANAGER],

    // Issue permissions
    CREATE_ISSUE: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER],
    EDIT_ISSUE: [ROLES.ADMIN, ROLES.MANAGER],
    ASSIGN_ISSUE: [ROLES.ADMIN, ROLES.MANAGER],
    UPDATE_ISSUE_STATUS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER],

    // Report permissions
    VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],

    // User permissions
    MANAGE_USERS: [ROLES.ADMIN],
};

// Check specific permission
export const can = (user, permission) => {
    if (!user) return false;
    const allowedRoles = PERMISSIONS[permission] || [];
    return allowedRoles.includes(user.role);
};

// Filter menu items based on role (used in MainLayout)
export const filterMenuByRole = (menuItems, user) => {
    if (!user) return [];

    return menuItems.filter(item => {
        // Special handling for Reports as per document
        if (item.text === 'Reports' && user.role === ROLES.MEMBER) {
            return false;
        }

        // Add more role-based filters as needed
        return true;
    });
};

// Check if user can access a route
export const canAccessRoute = (user, routeConfig) => {
    if (!user) return false;

    if (routeConfig.roles && routeConfig.roles.length > 0) {
        return routeConfig.roles.includes(user.role);
    }

    return true;
};