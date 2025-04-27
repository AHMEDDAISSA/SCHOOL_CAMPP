import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an axios instance with timeout and base URL
const api = axios.create({
  baseURL: 'http://192.168.1.18:3001', 
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

// POST: Login user
export const loginUser = async (email) => {
  try {
    const response = await api.post('/auth/login', { email });
    return response.data;
  } catch (error) {
    console.error('loginUser error:', error.message);
    throw error;
  }
};

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

export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    // Send userData directly without nesting it under 'user'
    const response = await api.post('/auth/register', { user: userData });
    return response.data;
  } catch (error) {
    console.error('registerUser error:', error);
    // More detailed error logging
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// === EMAIL VERIFICATION METHODS ===

// POST: Verify email with code
export const verifyEmail = async (userId, code) => {
  try {
    const response = await api.post('/auth/verify-email', { userId, code });
    return response.data;
  } catch (error) {
    console.error('verifyEmail error:', error.message);
    throw error;
  }
};

export const resendVerificationCode = async (userId) => {
  try {
    const response = await api.post('/auth/resend-verification', { userId });
    return response.data;
  } catch (error) {
    console.error('resendVerificationCode error:', error.message);
    throw error;
  }
};
// POST: Create a new ad/listing
export const createAd = async (token, adData) => {
  try {
    const response = await fetch(`/api/ads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adData)
    });
    return response.data;
  } catch (error) {
    console.error("createAd error:", error.message);
    throw error;
  }
};

// POST: Upload a single image
export const uploadImage = async (token, imageUri, adId) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    
    // Extract filename from uri
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Append image to form data
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg' // Adjust based on your file type
    });
    
    if (adId) {
      formData.append('adId', adId);
    }
    
    const response = await fetch(`/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    });
    return response.data;
  } catch (error) {
    console.error("uploadImage error:", error.message);
    throw error;
  }
};

// Helper function to upload multiple images
export const uploadMultipleImages = async (token, imageUris, adId) => {
  try {
    const uploadPromises = imageUris.map(uri => 
      uploadImage(token, uri, adId)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("uploadMultipleImages error:", error.message);
    throw error;
  }
};

// GET: Get all ads/listings
export const getAds = async () => {
  try {
    const response = await fetch(`/api/ads`);
    return response.data;
  } catch (error) {
    console.error("getAds error:", error.message);
    throw error;
  }
};

// GET: Get a specific ad/listing by ID
export const getAdById = async (adId) => {
  try {
    const response = await fetch(`/api/ads/${adId}`);
    return response.data;
  } catch (error) {
    console.error("getAdById error:", error.message);
    throw error;
  }
};

// GET: Get user's ads/listings
export const getUserAds = async (token) => {
  try {
    const response = await fetch(`/api/user/ads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("getUserAds error:", error.message);
    throw error;
  }
};

export default api;