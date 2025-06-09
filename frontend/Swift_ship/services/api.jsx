import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const api = axios.create({
  baseURL: 'http://192.168.1.21:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});


api.interceptors.response.use(
  response => {
    console.log(`[Response] ${response.status}:`, response.data);
    return response; // Retourner l'objet de réponse complet
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
    
    if (response.data && response.data.user) {
      const userData = response.data.user;
      const mappedData = {
        fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phoneNumber: userData.phone || '',
        profileImage: userData.profileImageUrl || userData.profileImage || null,
        role: userData.role || '',
        camp: userData.camp || '',
        isVerified: userData.isVerified || false,
        canPost: userData.canPost || false, // *** AJOUT CANPOST ***
      };
      response.data.user = { ...userData, ...mappedData };
    }
    
    return response; // Retourner response.data au lieu de response
  } catch (error) {
    console.error('loginUser error:', error.message);
    throw error;
  }
};

export const getUserByEmailApi = async (email) => {
  try {
    const response = await api.get(`/user/add-user?email=${encodeURIComponent(email)}`);
    
    if (response.data) {
      const userData = response.data;
      console.log('Raw user data from API:', userData);
      
      const mappedData = {
        fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phoneNumber: userData.phone || '',
        // CORRECTION : Utiliser la BASE_URL configurable
        profileImage: userData.profileImageUrl || 
                     (userData.profileImage ? `${BASE_URL}/uploads/${userData.profileImage}` : null),
        role: userData.role || '',
        camp: userData.camp || '',
        isVerified: userData.isVerified || false,
        canPost: userData.canPost || false,
      };
      
      console.log('Mapped user data with corrected image:', mappedData);
      return { ...userData, ...mappedData };
    }
    
    return response;
  } catch (error) {
    console.error('getUserByEmailApi error:', error.message);
    throw error;
  }
};

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

export const getAllUsers = async () => {
  try {
    const response = await api.get('/user/all-users');
    return response;
  } catch (error) {
    console.error('getAllUsers error:', error);
    throw error;
  }
};


export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    
    const formData = new FormData();
    
    // **MODIFICATION : Mapper correctement les champs**
    const fieldMapping = {
      firstName: 'first_name',
      lastName: 'last_name',
      phoneNumber: 'phone',
      // Autres champs restent identiques
    };
    
    Object.keys(userData).forEach(key => {
      if (key !== 'profileImage' && userData[key] !== undefined && userData[key] !== null) {
        const fieldName = fieldMapping[key] || key;
        formData.append(fieldName, userData[key].toString());
      }
    });
    
    if (userData.profileImage && userData.profileImage.startsWith('file://')) {
      const uriParts = userData.profileImage.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = userData.profileImage.includes('.jpeg') ? 'image/jpeg' : 
                     userData.profileImage.includes('.jpg') ? 'image/jpeg' : 
                     userData.profileImage.includes('.png') ? 'image/png' : 
                     'image/jpeg';
      
      formData.append('profileImage', {
        uri: userData.profileImage,
        name: fileName,
        type: fileType
      });
    }

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response;
  } catch (error) {
    console.error('registerUser error:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user with ID:', userId);
    const response = await api.delete(`/user/delete/${userId}`);
    
    console.log('Delete user response:', response);
    return response;
  } catch (error) {
    console.error('deleteUser error:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    throw error;
  }
};
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.put(`/user/update-status/${userId}`, 
      { status } // status should be 'active' or 'pending'
    );
    
    return response;
  } catch (error) {
    console.error('updateUserStatus error:', error);
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


export const createAnnounce = async (payload) => {
  const categoryMapping = {
    '1': 'Donner',
    '2': 'Prêter',
    '3': 'Emprunter',
    '4': 'Louer',
    '5': 'Acheter',
    '6': 'Échanger'
  };
  
  const categoryName = categoryMapping[payload.category] || payload.category;
  const formData = new FormData();
  
  // Données de base
  formData.append("email", payload.contactEmail);
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", categoryName);
  formData.append("camp", payload.camp);
  formData.append("is_published", payload.isActive.toString());
  formData.append("type", payload.type);
  formData.append("price", payload.price || "");
  formData.append("duration", payload.duration || "");
  
  // NOUVEAUX CHAMPS DE CONTACT
  formData.append("preferredContact", payload.preferredContact || "email");
  formData.append("contactEmail", payload.contactEmail || payload.email);
  formData.append("contactPhone", payload.contactPhone || "");
  formData.append("contactName", payload.contactName || "");
  formData.append("showName", payload.showName.toString());
  formData.append("showPhone", payload.showPhone.toString());
  formData.append("showEmail", payload.showEmail.toString());
  
  // Contact info basé sur la préférence
  let contactInfo = '';
  if (payload.preferredContact === 'email') {
    contactInfo = payload.contactEmail || payload.email;
  } else if (payload.preferredContact === 'phone') {
    contactInfo = payload.contactPhone;
  } else {
    contactInfo = 'app'; // Contact via l'application
  }
  formData.append("contact_info", contactInfo);
  
  // Images
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((imageUri, index) => {
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = imageUri.includes('.jpeg') ? 'image/jpeg' : 'image/png';
      
      formData.append('images', {
        uri: imageUri,
        name: fileName,
        type: fileType
      });
    });
  }
  
  try {
    const response = await api.post('/post/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error('createAnnounce error:', error.message);
    throw error;
  }
};


export const getPosts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.camp) queryParams.append('camp', params.camp);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/post/get?${queryString}` : '/post/get';
    
    console.log("Requête API vers:", url);
    const response = await api.get(url);
    
    // CORRECTION: Vérifiez la structure exacte de la réponse
    console.log("Structure de la réponse:", Object.keys(response));
    
    // Si vous utilisez axios, la propriété data contient la réponse du serveur
    // Si vous avez déjà modifié la réponse dans un intercepteur, ajustez en conséquence
    if (response.data) {
      return response.data; // Retourner les données, pas l'objet de réponse complet
    }
    
    return response; // Si votre interceptor a déjà extrait les données
  } catch (error) {
    console.error('getPosts error:', error.message);
    throw error;
  }
};

export const updateAnnonce = async (postId, updateData, userEmail, isAdmin = false) => {
  console.log("Updating post with ID:", postId, "Data:", updateData, "Admin:", isAdmin);
  try {
    const formData = new FormData();
    
    // Ajouter l'email de l'utilisateur et le statut admin pour vérification
    formData.append('userEmail', userEmail);
    formData.append('isAdmin', isAdmin.toString());
    
    // Ajouter les données textuelles en excluant l'email et les images
    Object.keys(updateData).forEach(key => {
      if (key === 'images' || key === 'email') {
        return;
      } else if (updateData[key] !== undefined && updateData[key] !== null) {
        formData.append(key, updateData[key].toString());
      }
    });

    // Traiter les images séparément
    if (updateData.images && updateData.images.length > 0) {
      updateData.images.forEach((imageUri, index) => {
        if (imageUri.startsWith('http')) {
          const fileName = imageUri.split('/').pop();
          formData.append('existingImages', fileName);
        } else {
          const uriParts = imageUri.split('/');
          const fileName = uriParts[uriParts.length - 1];
          const fileType = imageUri.includes('.jpeg') ? 'image/jpeg' : 
                          imageUri.includes('.jpg') ? 'image/jpeg' : 
                          imageUri.includes('.png') ? 'image/png' : 
                          'image/jpeg';
          
          formData.append('images', {
            uri: imageUri,
            name: fileName,
            type: fileType
          });
        }
      });
    }

    const response = await api.put(`/post/update/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    console.log('updateAnnonce response:', response);
    return response;
  } catch (error) {
    console.error('updateAnnonce error:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
    }
    throw error;
  }
};

// CORRECTION pour deleteAnnounce - déjà correct
export const deleteAnnounce = async (postId, userEmail, isAdmin = false) => {
  console.log("Deleting post with ID:", postId, "Admin:", isAdmin);
  try {
    const response = await api.delete(`/post/delete/${postId}?email=${encodeURIComponent(userEmail)}&isAdmin=${isAdmin}`);
    console.log('deleteAnnounce response:', response);
    return response;
  } catch (error) {
    console.error('deleteAnnounce error:', error.message);
    throw error;
  }
};
export const approveUser = async (userId) => {
  try {
    const response = await api.put(`/user/approve/${userId}`);
    return response; // Utilisez response au lieu de response.data pour la cohérence
  } catch (error) {
    console.error('approveUser error:', error);
    throw error;
  }
};

export const rejectUser = async (userId) => {
  try {
    const response = await api.put(`/user/reject/${userId}`);
    return response; // Utilisez response au lieu de response.data pour la cohérence
  } catch (error) {
    console.error('rejectUser error:', error);
    throw error;
  }
};

export const checkUserPermissions = async (userEmail) => {
  try {
    const response = await api.get(`/user/permissions/${encodeURIComponent(userEmail)}`);
    return response; // Utilisez response au lieu de response.data pour la cohérence
  } catch (error) {
    console.error('checkUserPermissions error:', error);
    throw error;
  }
};
export const resetSystemAnnual = async () => {
  try {
    const response = await api.post('/admin/reset-annual');
    return response;
  } catch (error) {
    console.error('resetSystemAnnual error:', error);
    throw error;
  }
};

export default api;