// API endpoints constants (as per API Contract document)
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login/',
        ME: '/auth/me/',
    },
    PROJECTS: {
        LIST: '/projects/',
        DETAIL: '/projects/{id}/',
    },
    SPRINTS: {
        LIST: '/sprints/',
        DETAIL: '/sprints/{id}/',
    },
    ISSUES: {
        LIST: '/issues/',
        DETAIL: '/issues/{id}/',
        STATUS: '/issues/{id}/status/',
        COMMENTS: '/issues/{id}/comments/',
    },
    TIMELOGS: {
        LIST: '/timelogs/',
        CREATE: '/timelogs/',
    },
    REPORTS: {
        PROJECT: '/reports/project/',
    },
};

// Issue types (as per database design)
export const ISSUE_TYPES = {
    TASK: 'TASK',
    BUG: 'BUG',
    STORY: 'STORY',
};

export const ISSUE_TYPE_OPTIONS = [
    { value: 'TASK', label: 'Task', color: 'primary' },
    { value: 'BUG', label: 'Bug', color: 'error' },
    { value: 'STORY', label: 'Story', color: 'success' },
];

// Priority levels (as per database design)
export const PRIORITIES = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};

export const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low', color: 'success' },
    { value: 'MEDIUM', label: 'Medium', color: 'info' },
    { value: 'HIGH', label: 'High', color: 'warning' },
    { value: 'CRITICAL', label: 'Critical', color: 'error' },
];

// Status workflow (default flow as per database design)
export const STATUS_FLOW = [
    'BACKLOG',
    'TO_DO',
    'IN_PROGRESS',
    'REVIEW',
    'DONE',
];

export const STATUS_OPTIONS = STATUS_FLOW.map(status => ({
    value: status,
    label: status.replace('_', ' '),
}));

// Project statuses
export const PROJECT_STATUS = {
    ACTIVE: 'ACTIVE',
    ON_HOLD: 'ON_HOLD',
    COMPLETED: 'COMPLETED',
};

// Sprint statuses
export const SPRINT_STATUS = {
    PLANNED: 'PLANNED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
};

// User roles (as per database design)
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    MEMBER: 'MEMBER',
};

// Local storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
};

// Date formats
export const DATE_FORMATS = {
    API: 'YYYY-MM-DD', // API expects YYYY-MM-DD
    DISPLAY: 'DD MMM YYYY',
    DISPLAY_WITH_TIME: 'DD MMM YYYY, hh:mm A',
};

// Default pagination
export const PAGINATION = {
    PAGE_SIZE: 10,
    PAGE: 1,
};

// Validation constants
export const VALIDATION = {
    PROJECT_KEY_MAX_LENGTH: 10,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 1000,
};