// src/config/api.js

/**
 * API Configuration
 * Automatically detects environment and uses correct API URL
 */

const getAPIUrl = () => {
    // Priority 1: Environment variable (for production build)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Priority 2: Check if running on localhost (development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }
    
    // Priority 3: Production URL (same domain as frontend)
    return window.location.origin;
};

export const API_BASE_URL = getAPIUrl();

console.log('🔧 API Base URL:', API_BASE_URL);

export default API_BASE_URL;