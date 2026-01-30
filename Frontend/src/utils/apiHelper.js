import { API_BASE_URL } from '../config/api';

/**
 * Build API URL
 */
export const buildApiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const fullEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
    const url = `${API_BASE_URL}/${fullEndpoint}`;
    
    console.log('🔗 Building URL:', url);
    return url;
};

/**
 * Get auth headers
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (!token) {
        console.warn('⚠️ No auth token found!');
    }
    
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Fetch wrapper with auth
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = buildApiUrl(endpoint);
    const headers = getAuthHeaders();
    
    console.log('📤 API Request:', options.method || 'GET', url);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            }
        });
        
        console.log('📥 API Response:', response.status, url);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ 
                error: `HTTP ${response.status}` 
            }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
};

export default {
    buildApiUrl,
    getAuthHeaders,
    apiFetch,
};