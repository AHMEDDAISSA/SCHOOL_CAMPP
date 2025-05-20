// googleAuth.js
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from './api';

// Assurez-vous que le navigateur se ferme après l'authentification
WebBrowser.maybeCompleteAuthSession();

// Remplacez par vos propres identifiants Google
const CONFIG = {
  expoClientId: 'VOTRE_EXPO_CLIENT_ID',
  iosClientId: 'VOTRE_IOS_CLIENT_ID',
  androidClientId: 'VOTRE_ANDROID_CLIENT_ID',
  webClientId: 'VOTRE_WEB_CLIENT_ID',
};

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest(CONFIG);

  const fetchUserInfoAndAuthenticate = async (accessToken) => {
    try {
      // 1. Récupérer les informations utilisateur depuis Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Impossible de récupérer les informations utilisateur depuis Google');
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('Google user info:', userInfo);
      
      // 2. Authentifier l'utilisateur sur votre serveur
      const authResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: accessToken,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          picture: userInfo.picture,
          // Ajoutez les champs requis par votre API
          camp: '507f1f77bcf86cd799439011',
          role: 'parent',
        }),
      });
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData.message || 'Échec de l\'authentification avec le serveur');
      }
      
      return await authResponse.json();
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  };

  return {
    request,
    response,
    promptAsync,
    fetchUserInfoAndAuthenticate,
  };
};
