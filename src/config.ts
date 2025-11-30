/**
 * Application Configuration
 * Automatically switches between development and production
 */

import Constants from 'expo-constants';

const isDevelopment = __DEV__;

// Get your local IP for development (replace with your actual IP)
const LOCAL_IP = '192.168.1.78';

// Backend API URL
export const API_BASE_URL = isDevelopment
  ? `http://${LOCAL_IP}:3000/api`  // Local development - same WiFi required
  : 'https://your-app.railway.app/api';  // Production - works from anywhere

// Environment info
export const ENV = {
  isDevelopment,
  isProduction: !isDevelopment,
  apiUrl: API_BASE_URL,
  appVersion: Constants.expoConfig?.version || '1.0.0',
};

console.log('🔧 Mobile Environment:', ENV);
