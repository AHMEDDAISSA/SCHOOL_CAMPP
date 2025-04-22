import axios from 'axios';

// Create an axios instance with a timeout
const api = axios.create({
  baseURL: 'http://192.168.168.65:3001', // Ensure this IP is correct
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add a reasonable timeout (10 seconds)
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('Request sent to:', config.url, 'with method:', config.method);
    console.log('Request data:', config.data || config.params);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    console.log('Response received successfully:', response.status);
    return response;
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Server might be down or unreachable.');
    } else if (!error.response) {
      console.error('Network error. Please check your connection and server status.');
      console.error('Server URL:', api.defaults.baseURL);
    } else {
      console.error('Response error:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;

// Method to add a user using GET request as per your current backend route
export const addUser = async (email) => {
  try {
    console.log('Attempting to add/authenticate user with email:', email);
    // According to your backend code, user lookup is via GET request
    const response = await api.get('/user/add-user', { 
      params: { email } 
    });
    console.log('User authenticated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error authenticating user:', error.message);
    throw error;
  }
};

// Alternative method using POST to root endpoint (if you want to create users)
export const createUser = async (email) => {
  try {
    console.log('Attempting to create new user with email:', email);
    // Your backend has a POST route at root /user
    const response = await api.post('/user', { email });
    console.log('User created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

// Method to get all users (for admin purposes if needed)
export const getUsers = async () => {
  try {
    const response = await api.post('/user/get-users');
    console.log('Users retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    throw error;
  }
};

// Method to get a specific user with authentication
export const getUser = async (token) => {
  try {
    const response = await api.post('/user/get-user', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('User details retrieved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error retrieving user details:', error.message);
    throw error;
  }
};
