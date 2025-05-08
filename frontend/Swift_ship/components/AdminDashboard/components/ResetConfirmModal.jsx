import React from 'react';
import { View, Modal, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Styles
import styles from '../styles';

const ResetConfirmModal = ({ visible, theme, onCancel, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.confirmModalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.warningIconContainer}>
            <MaterialIcons name="warning" size={50} color="#FFA500" />
          </View>
          
          <Text style={[styles.confirmModalTitle, { color: theme.textColor }]}>
            Réinitialiser le système
          </Text>
          
          <Text style={[styles.confirmModalText, { color: theme.textSecondary }]}>
            Cette action réinitialisera toutes les données pour la nouvelle année scolaire. Toutes les annonces et les interactions passées seront archivées et non accessibles aux utilisateurs.
          </Text>
          <Text style={[styles.confirmModalText, { color: theme.textSecondary }]}>
            Êtes-vous sûr de vouloir continuer?
          </Text>
          
          <View style={styles.confirmModalActions}>
            <TouchableOpacity 
              style={[styles.confirmModalButton, styles.cancelButton]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Annuler"
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmModalButton, styles.confirmButton]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirmer la réinitialisation"
            >
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ResetConfirmModal;