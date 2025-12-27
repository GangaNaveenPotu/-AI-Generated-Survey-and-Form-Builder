// API Configuration
// In production, this will be set by environment variables
// In development, it defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

