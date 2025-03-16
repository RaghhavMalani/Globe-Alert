
/**
 * Application configuration
 */
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
    newsEndpoint: '/events',
  },
  // Add other configuration values as needed
  map: {
    defaultZoom: 5,
    maxZoom: 7,
    minZoom: 2.5,
  },
};
