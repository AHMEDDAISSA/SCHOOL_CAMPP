import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ThemeContext from '../../theme/ThemeContext';
import { Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';

import BackIcon from '../../assets/images/back.svg';
import EditIcon from '../../assets/images/editttttt.svg';
import UserIcon from '../../assets/images/user.svg';
import EmailIcon from '../../assets/images/email.svg';
import PhoneIcon from '../../assets/images/phone.svg';
import SecurityIcon from '../../assets/images/security.svg';
import NotificationIcon from '../../assets/images/notification.svg';
import LanguageIcon from '../../assets/images/language.svg';

const AccountSettings = () => {
  const { theme, darkMode } = useContext(ThemeContext);
  
  // États pour les informations utilisateur
  const [userInfo, setUserInfo] = useState({
    firstName: 'ahmed',
    lastName: 'aissa',
    email: 'aisssaahmed9@gmail.com',
    phone: '+44 963392877',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Données des sections de paramètres
  const settingsData = [
    {
      id: 1,
      title: 'Informations personnelles',
      items: [
        {
          id: 'profile',
          name: 'Modifier le profil',
          icon: <UserIcon width={20} height={20} />,
          type: 'navigation',
          onPress: () => setIsEditing(!isEditing)
        }
      ]
    },
    {
      id: 2,
      title: 'Sécurité',
      items: [
        // {
        //   id: 'password',
        //   name: 'Changer le mot de passe',
        //   icon: <SecurityIcon width={20} height={20} />,
        //   type: 'navigation',
        //   onPress: () => Alert.alert('Info', 'Fonctionnalité à implémenter')
        // },
        {
          id: 'twofa',
          name: 'Authentification à deux facteurs',
          icon: <SecurityIcon width={20} height={20} />,
          type: 'navigation',
          onPress: () => Alert.alert('Info', 'Fonctionnalité à implémenter')
        }
      ]
    },
    {
      id: 3,
      title: 'Notifications',
      items: [
        {
          id: 'push_notifications',
          name: 'Notifications push',
          icon: <NotificationIcon width={20} height={20} />,
          type: 'switch',
          value: notifications,
          onToggle: setNotifications
        },
        {
          id: 'email_notifications',
          name: 'Notifications par email',
          icon: <EmailIcon width={20} height={20} />,
          type: 'switch',
          value: emailNotifications,
          onToggle: setEmailNotifications
        }
      ]
    },
    {
      id: 4,
      title: 'Préférences',
      items: [
        {
          id: 'language',
          name: 'Langue',
          icon: <LanguageIcon width={20} height={20} />,
          type: 'navigation',
          value: 'Français',
          onPress: () => Alert.alert('Info', 'Sélection de langue à implémenter')
        }
      ]
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Succès', 'Informations mises à jour avec succès');
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProfileSection = () => (
    <View style={[styles.section, { backgroundColor: theme.cardbg }]}>
      <Text style={[styles.sectionTitle, { color: theme.color3 }]}>
        Informations personnelles
      </Text>
      
      <View style={styles.profileInfo}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.color3 }]}>Prénom</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.color3,
                borderColor: darkMode ? '#444' : '#ddd'
              }]}
              value={userInfo.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Prénom"
              placeholderTextColor={darkMode ? '#888' : '#999'}
            />
          ) : (
            <Text style={[styles.value, { color: theme.color3 }]}>
              {userInfo.firstName}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.color3 }]}>Nom</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.color3,
                borderColor: darkMode ? '#444' : '#ddd'
              }]}
              value={userInfo.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Nom"
              placeholderTextColor={darkMode ? '#888' : '#999'}
            />
          ) : (
            <Text style={[styles.value, { color: theme.color3 }]}>
              {userInfo.lastName}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.color3 }]}>Email</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.color3,
                borderColor: darkMode ? '#444' : '#ddd'
              }]}
              value={userInfo.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor={darkMode ? '#888' : '#999'}
            />
          ) : (
            <Text style={[styles.value, { color: theme.color3 }]}>
              {userInfo.email}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.color3 }]}>Téléphone</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.color3,
                borderColor: darkMode ? '#444' : '#ddd'
              }]}
              value={userInfo.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Téléphone"
              keyboardType="phone-pad"
              placeholderTextColor={darkMode ? '#888' : '#999'}
            />
          ) : (
            <Text style={[styles.value, { color: theme.color3 }]}>
              {userInfo.phone}
            </Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { borderColor: darkMode ? '#555' : '#ddd' }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={[styles.buttonText, { color: theme.color3 }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderSettingsSection = (section) => (
    <View key={section.id} style={[styles.section, { backgroundColor: theme.cardbg }]}>
      <Text style={[styles.sectionTitle, { color: theme.color3 }]}>
        {section.title}
      </Text>
      
      {section.items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={item.type === 'navigation' ? item.onPress : undefined}
            disabled={item.type === 'switch'}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { 
                backgroundColor: darkMode ? 'rgba(131, 110, 254, 0.15)' : '#f0f0ff' 
              }]}>
                {item.icon}
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingName, { color: theme.color3 }]}>
                  {item.name}
                </Text>
                {item.value && item.type === 'navigation' && (
                  <Text style={[styles.settingValue, { color: darkMode ? '#888' : '#666' }]}>
                    {item.value}
                  </Text>
                )}
              </View>
            </View>
            
            {item.type === 'switch' ? (
              <Switch
                trackColor={{ false: "#767577", true: "#836EFE" }}
                thumbColor={item.value ? "#f4f3f4" : "#f4f3f4"}
                onValueChange={item.onToggle}
                value={item.value}
                style={styles.switch}
              />
            ) : (
              <Text style={[styles.arrow, { color: darkMode ? '#888' : '#666' }]}>›</Text>
            )}
          </TouchableOpacity>
          
          {index < section.items.length - 1 && (
            <View style={[styles.divider, { backgroundColor: darkMode ? '#333' : '#eee' }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <BackIcon width={24} height={24} color={theme.color3} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.color3 }]}>
          Paramètres du compte
        </Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <EditIcon width={24} height={24} color="#836EFE" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Section du profil */}
        {renderProfileSection()}
        
        {/* Sections des paramètres */}
        {settingsData.map(section => renderSettingsSection(section))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowColor: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 16,
  },
  profileInfo: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#836EFE',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingName: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  settingValue: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 2,
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
  arrow: {
    fontSize: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  bottomSpacing: {
    height: 32,
  },
});