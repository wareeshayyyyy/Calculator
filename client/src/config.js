// Environment configuration
const config = {
  development: {
    API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL || window.location.origin + '/api',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || window.location.origin,
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
