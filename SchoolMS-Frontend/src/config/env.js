/**
 * Environment configuration.
 * Change BASE_URL to your server address.
 * For local Android emulator use: 'http://10.0.2.2:5000/api'
 * For local iOS simulator use: 'http://localhost:5000/api'
 * For production use your deployed server URL.
 */

const ENV = {
  development: {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000,
  },
  production: {
    BASE_URL: 'https://schoolms-backend.onrender.com/api',  // ← replace with your actual Render URL
    TIMEOUT: 30000,
  },
};

const getEnv = () => {
  if (__DEV__) return ENV.development;
  return ENV.production;
};

export default getEnv();
