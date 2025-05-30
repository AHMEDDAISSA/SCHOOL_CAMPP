import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const DynamicContactButton = ({ 
  item,
  userEmail,
  onInAppMessage,
  style = {},
  textStyle = {}
}) => {
  // Ne pas afficher le bouton si c'est le propriétaire
  if (userEmail === item.email || userEmail === item.contactEmail) {
    return null;
  }

  // Configuration du bouton selon la méthode préférée
  const getButtonConfig = () => {
    switch (item.preferredContact) {
      case 'email':
        return {
          icon: 'mail-outline',
          text: 'Email',
          color: '#4285F4',
          action: () => handleEmailContact()
        };
      case 'phone':
        return {
          icon: 'call-outline',
          text: 'Appeler',
          color: '#34A853',
          action: () => handlePhoneContact()
        };
      case 'app':
      default:
        return {
          icon: 'chatbubble-outline',
          text: 'Message',
          color: '#836EFE',
          action: () => onInAppMessage && onInAppMessage()
        };
    }
  };

  const handleEmailContact = async () => {
    const email = item.contactEmail || item.email;
    const subject = `À propos de votre annonce: ${item.title}`;
    const body = `Bonjour${item.showName && item.contactName ? ` ${item.contactName}` : ''},\n\nJe suis intéressé(e) par votre annonce "${item.title}".\n\nCordialement.`;
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Erreur', "Impossible d'ouvrir l'application email");
      }
    } catch (error) {
      console.error('Erreur email:', error);
      Alert.alert('Erreur', "Impossible d'ouvrir l'application email");
    }
  };

  const handlePhoneContact = () => {
    if (!item.contactPhone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
      return;
    }

    Alert.alert(
      'Contacter par téléphone',
      `Comment souhaitez-vous contacter${item.showName && item.contactName ? ` ${item.contactName}` : ' cette personne'} ?`,
      [
        {
          text: 'Appeler',
          onPress: () => Linking.openURL(`tel:${item.contactPhone}`)
        },
        {
          text: 'SMS',
          onPress: () => {
            const message = `Bonjour${item.showName && item.contactName ? ` ${item.contactName}` : ''}, je suis intéressé(e) par votre annonce "${item.title}".`;
            Linking.openURL(`sms:${item.contactPhone}?body=${encodeURIComponent(message)}`);
          }
        },
        {
          text: 'WhatsApp',
          onPress: () => {
            const message = `Bonjour${item.showName && item.contactName ? ` ${item.contactName}` : ''}, je suis intéressé(e) par votre annonce "${item.title}".`;
            let whatsappNumber = item.contactPhone.replace(/\s+/g, '');
            if (whatsappNumber.startsWith('0')) {
              whatsappNumber = `41${whatsappNumber.substring(1)}`;
            }
            Linking.openURL(`whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`);
          }
        },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[
        styles.dynamicContactButton,
        { backgroundColor: config.color },
        style
      ]}
      onPress={config.action}
    >
      <Ionicons 
        name={config.icon} 
        size={16} 
        color="#FFFFFF" 
        style={styles.contactButtonIcon} 
      />
      <Text style={[styles.contactButtonText, textStyle]}>
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dynamicContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  contactButtonIcon: {
    marginRight: 6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DynamicContactButton;