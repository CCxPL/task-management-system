import { API_BASE_URL } from '../config/api';

/**
 * Build API URL
 * @param {string} endpoint - API endpoint (e.g., '/api/issues/')
 * @returns {string} Full URL
 */
export const buildApiUrl = (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Ensure /api prefix if not present
    const fullEndpoint = cleanEndpoint.startsWith('api/') 
        ? cleanEndpoint 
        : `api/${cleanEndpoint}`;
    
    return `${API_BASE_URL}/${fullEndpoint}`;
};

/**
 * Get auth headers
 * @returns {Object} Headers with Authorization
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Fetch wrapper with auth
 * @param {string} endpoint 
 * @param {Object} options 
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = buildApiUrl(endpoint);
    const headers = getAuthHeaders();
    
    console.log('📤 API Request:', options.method || 'GET', url);
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        }
    });
    
    console.log('📥 API Response:', response.status, url);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
};

export default {
    buildApiUrl,
    getAuthHeaders,
    apiFetch,
};