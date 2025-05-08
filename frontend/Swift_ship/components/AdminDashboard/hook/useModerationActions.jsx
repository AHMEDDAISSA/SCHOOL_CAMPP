import { useCallback } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { 
  moderateListing, 
  resetSystem,
  blockUser 
} from '../../../services/api';

const useModerationActions = (loadData, closeResetModal) => {
  // Moderate listing
  const handleModerateListing = useCallback(async (id, action) => {
    try {
      await moderateListing(id, action);
      
      Toast.show({
        type: 'success',
        text1: 'Action effectuée',
        text2: action === 'approve' ? 'Annonce approuvée' : 
               action === 'reject' ? 'Annonce rejetée' : 'Annonce réinitialisée',
        visibilityTime: 2000,
        topOffset: 50
      });
      
      // Reload data to update UI
      loadData();
    } catch (error) {
      console.error('Error moderating listing:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue lors de la modération',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, [loadData]);

  // Block/unblock user
  const handleBlockUser = useCallback(async (userId, isBlocked) => {
    try {
      await blockUser(userId, !isBlocked);
      
      Toast.show({
        type: 'success',
        text1: 'Action effectuée',
        text2: isBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué',
        visibilityTime: 2000,
        topOffset: 50
      });
      
      // Reload data to update UI
      loadData();
    } catch (error) {
      console.error('Error toggling user block status:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, [loadData]);

  // Handle user role change
  const handleRoleChange = useCallback((user) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous modifier le rôle de ${user.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer',
          onPress: () => {
            // Implementation for role change
            Toast.show({
              type: 'success',
              text1: 'Rôle modifié',
              visibilityTime: 2000,
              topOffset: 50
            });
            loadData();
          }
        }
      ]
    );
  }, [loadData]);

  // System reset
  const handleSystemReset = useCallback(async () => {
    closeResetModal();
    
    try {
      await resetSystem();
      
      Toast.show({
        type: 'success',
        text1: 'Système réinitialisé',
        text2: 'Les données ont été effacées pour la nouvelle année',
        visibilityTime: 3000,
        topOffset: 50
      });
      
      // Reload data after reset
      await loadData();
    } catch (error) {
      console.error('Error resetting system:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de réinitialiser le système',
        visibilityTime: 3000,
        topOffset: 50
      });
    }
  }, [loadData, closeResetModal]);

  return {
    handleModerateListing,
    handleBlockUser,
    handleRoleChange,
    handleSystemReset
  };
};

export default useModerationActions;