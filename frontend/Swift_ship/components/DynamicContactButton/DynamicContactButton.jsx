import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const DynamicContactButton = ({ 
  contactMethod, 
  contactInfo, 
  title, 
  disabled = false, 
  style = {},
  textStyle = {}
}) => {
  // Configuration de l'apparence du bouton selon la méthode
  const getButtonConfig = () => {
    switch (contactMethod) {
      case 'email':
        return {
          icon: 'mail-outline',
          text: 'Email',
          color: '#4285F4',
          action: () => handleEmailContact(contactInfo, title)
        };
      case 'phone':
        return {
          icon: 'call-outline',
          text: 'Appeler',
          color: '#34A853',
          action: () => handlePhoneContact(contactInfo)
        };
      case 'whatsapp':
        return {
          icon: 'logo-whatsapp',
          text: 'WhatsApp',
          color: '#25D366',
          action: () => handleWhatsAppContact(contactInfo, title)
        };
      case 'sms':
        return {
          icon: 'chatbox-outline',
          text: 'SMS',
          color: '#FF9800',
          action: () => handleSmsContact(contactInfo, title)
        };
      case 'app':
      default:
        return {
          icon: 'chatbubble-outline',
          text: 'Message',
          color: '#836EFE',
          action: () => console.log('Action via app')
        };
    }
  };

  // Gérer contact par email
  const handleEmailContact = async (email, subject) => {
    const emailSubject = `À propos de: ${subject || 'votre annonce'}`;
    const emailBody = `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${subject || ''}".`;
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        console.error("L'application email n'est pas disponible");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de l\'email:', error);
    }
  };

  // Gérer contact par téléphone
  const handlePhoneContact = async (phoneNumber) => {
    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Les appels téléphoniques ne sont pas supportés");
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel:', error);
    }
  };

  // Gérer contact par WhatsApp
  const handleWhatsAppContact = async (phoneNumber, subject) => {
    try {
      const message = `Bonjour, je suis intéressé(e) par votre annonce "${subject || ''}".`;
      // Formater le numéro pour WhatsApp (retirer le + initial)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
      const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("WhatsApp n'est pas installé");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de WhatsApp:', error);
    }
  };

  // Gérer contact par SMS
  const handleSmsContact = async (phoneNumber, subject) => {
    try {
      const message = `Bonjour, je suis intéressé(e) par votre annonce "${subject || ''}".`;
      const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Les SMS ne sont pas supportés");
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[
        styles.dynamicContactButton,
        { backgroundColor: config.color },
        disabled && styles.disabledContactButton,
        style
      ]}
      onPress={config.action}
      disabled={disabled}
    >
      <Ionicons 
        name={config.icon} 
        size={18} 
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  
  contactButtonIcon: {
    marginRight: 8,
  },
  
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  disabledContactButton: {
    opacity: 0.6,
    backgroundColor: '#CCCCCC',
  },
});

export default DynamicContactButton;