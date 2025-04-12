
/**
 * Application configuration
 */
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    newsEndpoint: '/api/events',
  },
  // Add other configuration values as needed
  map: {
    defaultZoom: 5,
    maxZoom: 7,
    minZoom: 2.5,
  },
  mongodb: {
    uri: import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/geosphere-war-alert',
    dbName: 'geosphere-war-alert',
    collections: {
      events: 'events',
    }
  }
};
