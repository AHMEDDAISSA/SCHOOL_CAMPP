import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demander les permissions de notification
export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Enregistrer le token Expo de l'utilisateur
export const registerDeviceForNotifications = async (email) => {
  try {
    if (!Device.isDevice) {
      throw new Error("Les notifications ne sont pas disponibles sur les émulateurs");
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Sauvegarder le token localement
    await AsyncStorage.setItem('expoPushToken', token);
    
    // Envoyer le token au backend
    const response = await fetch('/api/users/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
        platform: Platform.OS,
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du dispositif:', error);
    return false;
  }
};

// Configurer la gestion des notifications
export const setupNotifications = () => {
  // Écouteur pour les notifications en arrière-plan
  Notifications.addNotificationResponseReceivedListener(response => {
    handleNotificationNavigation(response.notification);
  });

  // Écouteur pour les notifications au premier plan
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue au premier plan:', notification);
    
    saveNotification(notification);
    
    // Afficher le toast
    Toast.show({
      type: 'info',
      text1: notification.request.content.title,
      text2: notification.request.content.body,
      onPress: () => handleNotificationNavigation(notification)
    });
  });

  return () => subscription.remove();
};

// Gestion de la navigation pour les notifications
const handleNotificationNavigation = (notification) => {
  const data = notification.request.content.data;
  
  if (data?.postId) {
    router.push(`/annonce/${data.postId}`);
  } else if (data?.conversationId) {
    router.push(`(screens)/chat_screen?id=${data.conversationId}`);
  }
};

// Sauvegarder une notification
const saveNotification = async (notification) => {
  try {
    const storedNotifications = await AsyncStorage.getItem('notifications');
    const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    notifications.unshift({
      id: notification.identifier || Date.now().toString(),
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
      timestamp: Date.now(),
      read: false,
    });
    
    if (notifications.length > 50) notifications.splice(50);
    
    await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

// Récupérer les notifications (inchangé)
export const getNotifications = async () => {
  try {
    const storedNotifications = await AsyncStorage.getItem('notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return [];
  }
};