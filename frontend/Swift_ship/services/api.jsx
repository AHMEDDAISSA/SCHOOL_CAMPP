import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an axios instance with timeout and base URL
const api = axios.create({
  baseURL: 'http://192.168.168.65:3001', // Update IP as needed
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) console.log('Payload:', config.data);
    if (config.params) console.log('Query Params:', config.params);
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log(`[Response] ${response.status}:`, response.data);
    return response;
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Server might be down.');
    } else if (!error.response) {
      console.error('Network error. Check server and connection.');
    } else {
      console.error(`[Error ${error.response.status}]`, error.response.data);
    }
    return Promise.reject(error);
  }
);

// === AUTH & USER METHODS ===

// GET: Authenticate or add user
export const addUser = async (email) => {
  try {
    const response = await api.get('/user/add-user', { params: { email } });
    return response.data;
  } catch (error) {
    console.error('addUser error:', error.message);
    throw error;
  }
};

// POST: Create new user
export const createUser = async (email) => {
  try {
    const response = await api.post('/user', { email });
    return response.data;
  } catch (error) {
    console.error('createUser error:', error.message);
    throw error;
  }
};

// POST: Get all users (admin purpose)
export const getUsers = async () => {
  try {
    const response = await api.post('/user/get-users');
    return response.data;
  } catch (error) {
    console.error('getUsers error:', error.message);
    throw error;
  }
};

// POST: Get a user with token
export const getUser = async (token) => {
  try {
    const response = await api.post('/user/get-user', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('getUser error:', error.message);
    throw error;
  }
};

// POST: Register user (with extra data)
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/user', { user: userData });
    return response.data;
  } catch (error) {
    console.error('registerUser error:', error.message);
    throw error;
  }
};

// === EMAIL VERIFICATION METHODS ===

// POST: Verify email with code
export const verifyEmail = async (email, camp, code) => {
  try {
    const response = await api.post('/auth/verify-email', { email, camp, code });
    return response.data;
  } catch (error) {
    console.error('verifyEmail error:', error.message);
    throw error;
  }
};

// POST: Resend verification code
export const resendVerificationCode = async (email, camp) => {
  try {
    const response = await api.post('/auth/resend-verification', { email, camp });
    return response.data;
  } catch (error) {
    console.error('resendVerificationCode error:', error.message);
    throw error;
  }
};

export default api;
