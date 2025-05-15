import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const api = axios.create({
  baseURL: 'http://192.168.168.65:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});


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
    return response.data;
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
    return response;
  } catch (error) {
    console.error('loginUser error:', error.message);
    throw error;
  }
};

// GET: Authenticate or add user
export const addUser = async (email) => {
  try {
    const response = await api.post('/user/add-user', { params: { email } });
    return response;
  } catch (error) {
    console.error('addUser error:', error.message);
    throw error;
  }
};

// POST: Create new user
export const createUser = async (email) => {
  try {
    const response = await api.post('/user', { email });
    return response;
  } catch (error) {
    console.error('createUser error:', error.message);
    throw error;
  }
};

// POST: Get all users (admin purpose)
export const getUsers = async () => {
  try {
    const response = await api.post('/user/get-users');
    return response;
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
    return response;
  } catch (error) {
    console.error('getUser error:', error.message);
    throw error;
  }
};

// POST: Register user
export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    const response = await api.post('/auth/register', { user: userData });
    return response;
  } catch (error) {
    console.error('registerUser error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// === EMAIL VERIFICATION METHODS ===

// POST: Verify OTP with code
export const verifyOTP = async (userId, code) => {
  try {
    const response = await api.post('/auth/verify-email', { userId, code });
    return response;
  } catch (error) {
    console.error('verifyOTP error:', error.message);
    throw error;
  }
};

// POST: Resend OTP
export const resendOTP = async (userId, email = null) => {
  try {
    const payload = {};
    if (userId) payload.userId = userId;
    if (email) payload.email = email;
    
    // Make sure this endpoint matches what's in your routes file
    const response = await api.post('/auth/resend-otp', payload);
    return response;
  } catch (error) {
    console.error('resendOTP error:', error.message);
    throw error;
  }
};

// === AD/LISTING METHODS ===

// POST: Create a new ad/listing
export const createAd = async (token, adData) => {
  try {
    const response = await api.post('/api/ads', adData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('createAd error:', error.message);
    throw error;
  }
};

// POST: Upload a single image
export const uploadImage = async (token, imageUri, adId) => {
  try {
    const formData = new FormData();
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    formData.append('image', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg'
    });
    
    if (adId) {
      formData.append('adId', adId);
    }
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('uploadImage error:', error.message);
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
    console.error('uploadMultipleImages error:', error.message);
    throw error;
  }
};

// GET: Get all ads/listings
export const getAds = async () => {
  try {
    const response = await api.get('/api/ads');
    return response;
  } catch (error) {
    console.error('getAds error:', error.message);
    throw error;
  }
};

// GET: Get a specific ad/listing by ID
export const getAdById = async (adId) => {
  try {
    const response = await api.get(`/api/ads/${adId}`);
    return response;
  } catch (error) {
    console.error('getAdById error:', error.message);
    throw error;
  }
};

// GET: Get user's ads/listings
export const getUserAds = async (token) => {
  try {
    const response = await api.get('/api/user/ads', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('getUserAds error:', error.message);
    throw error;
  }
};

// === ADMIN METHODS ===

// GET: Fetch admin statistics
export const fetchStatistics = async (token) => {
  try {
    const response = await api.get('/api/admin/statistics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('fetchStatistics error:', error.message);
    throw error;
  }
};

// GET: Fetch listings (all or pending announcements)
export const fetchListings = async (token) => {
  try {
    const response = await api.get('/api/admin/pending-announcements', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('fetchListings error:', error.message);
    throw error;
  }
};

// POST: Moderate a listing (approve/reject/reset)
export const moderateListing = async (listingId, action, token) => {
  try {
    const response = await api.post(`/api/admin/listings/${listingId}/moderate`, { action }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('moderateListing error:', error.message);
    throw error;
  }
};

// GET: Fetch all users
export const fetchUsers = async (token) => {
  try {
    const response = await api.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('fetchUsers error:', error.message);
    throw error;
  }
};

// PUT: Block or unblock a user
export const blockUser = async (userId, isBlocked, token) => {
  try {
    const response = await api.put(`/api/admin/users/${userId}/toggle-status`, { isActive: !isBlocked }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('blockUser error:', error.message);
    throw error;
  }
};

// POST: Reset the system (annual reset)
export const resetSystem = async (token) => {
  try {
    const response = await api.post('/api/admin/reset-system', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('resetSystem error:', error.message);
    throw error;
  }
};

// GET: Get system settings
export const getSystemSettings = async (token) => {
  try {
    const response = await api.get('/api/admin/settings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('getSystemSettings error:', error.message);
    throw error;
  }
};

// PUT: Update system settings
export const updateSystemSettings = async (token, settings) => {
  try {
    const response = await api.put('/api/admin/settings', settings, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  } catch (error) {
    console.error('updateSystemSettings error:', error.message);
    throw error;
  }
};

// POST: Create new user
export const createAnnounce = async (payload) => {
  const apiPayload = { 
    "email": payload.contactEmail, 
    "title": payload.title, 
    "description": payload.description, 
    "category": payload.category, 
    // "published_by": ObjectId('681db7e65e92e6e77b1d352b'),
    "camp": payload.camp,
    "is_published": true,
    "contact_info": payload.contactPhone,
    "type": payload.type 
  }
  
  try {
    const response = await api.post('/post/add', apiPayload);
    console.log('jaweb', response);
    return response.data;
  } catch (error) {
    console.error('createAnnounce error:', error.message);
    throw error;
  }
};
export const deleteAnnounce = async (postId) => {
  try {
    const response = await api.delete(`/post/delete`, { data: { id: postId } });
    console.log('réponse suppression:', response);
    return response;
  } catch (error) {
    console.error('deleteAnnounce error:', error.message);
    throw error;
  }
};



export const getPosts = async (params = {}) => {
  try {
    // Construire les paramètres de requête
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.camp) queryParams.append('camp', params.camp);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/post/get?${queryString}` : '/post/get';
    
    const response = await api.get(url);
    console.log('getPosts response:', response);
    return response;
  } catch (error) {
    console.error('getPosts error:', error.message);
    throw error;
  }
};


export default api;