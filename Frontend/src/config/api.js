// ✅ PRODUCTION-SAFE API CONFIGURATION
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔧 API Configuration Loaded:');
console.log('   - VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('   - API_BASE_URL:', API_BASE_URL);
console.log('   - Mode:', import.meta.env.MODE);

// Helper to check if running in production
export const isProduction = import.meta.env.MODE === 'production';

export default {
    API_BASE_URL,
    isProduction,
};