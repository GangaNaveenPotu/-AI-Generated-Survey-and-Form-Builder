// API Configuration
// In production, this will be set by environment variables
// In development, it defaults to localhost
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash to prevent double slashes in URLs
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

// Log the API URL for debugging
if (typeof window !== 'undefined') {
    const expectedProductionURL = 'https://ai-generated-survey-and-form-builder.onrender.com';
    if (API_BASE_URL !== 'http://localhost:5000' && API_BASE_URL !== expectedProductionURL) {
        console.warn('⚠️ API URL mismatch detected!');
        console.warn('Current API URL:', API_BASE_URL);
        console.warn('Expected URL:', expectedProductionURL);
        console.warn('Please check Vercel environment variable VITE_API_URL');
    } else {
        console.log('✅ API URL configured:', API_BASE_URL);
    }
}

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  FORMS: `${API_BASE_URL}/api/v1/forms`,
  FORM: (id) => `${API_BASE_URL}/api/v1/forms/${id}`,
  RESPONSE: (id) => `${API_BASE_URL}/api/v1/forms/${id}/response`,
  ANALYTICS: (id) => `${API_BASE_URL}/api/v1/forms/${id}/analytics`,
  AI_GENERATE: `${API_BASE_URL}/api/v1/ai/generate`,
  AI_GENERATE_FORM: `${API_BASE_URL}/api/v1/ai/generate-form`,
};

export default API_ENDPOINTS;

