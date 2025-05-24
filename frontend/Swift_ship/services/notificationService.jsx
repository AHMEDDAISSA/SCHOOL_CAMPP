import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demander les permissions de notification
export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
};

// Enregistrer le token FCM de l'utilisateur dans votre backend
export const registerDeviceForNotifications = async (email) => {
  try {
    const token = await messaging().getToken();
    
    // Sauvegarder le token localement
    await AsyncStorage.setItem('fcmToken', token);
    
    // Envoyer le token au backend pour l'associer à l'utilisateur
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
export const setupNotifications = async () => {
  // Gérer les notifications lorsque l'application est en arrière-plan
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background:', remoteMessage);
    // Sauvegarder la notification pour l'afficher plus tard
    await saveNotification(remoteMessage);
  });
  
  // Gérer les notifications lorsque l'application est au premier plan
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Notification reçue au premier plan:', remoteMessage);
    
    // Sauvegarder la notification
    await saveNotification(remoteMessage);
    
    // Montrer la notification dans l'application
    // Vous pouvez utiliser React Native Toast pour cela
    Toast.show({
      type: 'info',
      text1: remoteMessage.notification.title,
      text2: remoteMessage.notification.body,
      onPress: () => {
        // Naviguer vers la conversation ou l'annonce concernée
        if (remoteMessage.data && remoteMessage.data.postId) {
          router.push(`/annonce/${remoteMessage.data.postId}`);
        } else if (remoteMessage.data && remoteMessage.data.conversationId) {
          router.push(`(screens)/chat_screen?id=${remoteMessage.data.conversationId}`);
        }
      }
    });
  });
  
  return unsubscribe;
};

// Sauvegarder une notification pour l'historique
const saveNotification = async (notification) => {
  try {
    const storedNotifications = await AsyncStorage.getItem('notifications');
    const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    // Ajouter la nouvelle notification
    notifications.unshift({
      id: Date.now().toString(),
      title: notification.notification.title,
      body: notification.notification.body,
      data: notification.data,
      timestamp: Date.now(),
      read: false,
    });
    
    // Limiter à 50 notifications max
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    
    await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la notification:', error);
  }
};

// Récupérer toutes les notifications sauvegardées
export const getNotifications = async () => {
  try {
    const storedNotifications = await AsyncStorage.getItem('notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};