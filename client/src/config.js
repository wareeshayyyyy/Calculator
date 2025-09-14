// Environment configuration
const isNetlify = window.location.hostname.includes('netlify.app');
const isLocal = window.location.hostname === 'localhost';

const config = {
  development: {
    API_URL: 'http://localhost:3001',
    SOCKET_URL: 'http://localhost:3001',
  },
  production: {
    API_URL: isNetlify ? window.location.origin + '/.netlify/functions' : (process.env.REACT_APP_API_URL || window.location.origin + '/api'),
    SOCKET_URL: isNetlify ? window.location.origin : (process.env.REACT_APP_SOCKET_URL || window.location.origin),
  }
};

const environment = isLocal ? 'development' : 'production';
export default config[environment];
