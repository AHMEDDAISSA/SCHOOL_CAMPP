import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import React, { useContext } from 'react';
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";
import { Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
// Importez vos icônes ici
import SettingsIcon from '../../assets/images/setting.svg'; 
import DarkSettingsIcon from '../../assets/images/settinglight.svg'; // À créer ou importer
import ModeIcon from '../../assets/images/dark mode.svg'; // À créer ou importer
import DarkModeIcon from '../../assets/images/dark-mode-light.svg'; // À créer ou importer
import SupportIcon from '../../assets/images/support-b.svg'; // À créer ou importer
import DarkSupportIcon from '../../assets/images/support-bl.svg'; // À créer ou importer
import ArrowIcon from '../../assets/images/arrow.svg'; // À créer ou importer


// Nouveau tableau de données sans les sections à supprimer
const profile_data = [
  {
    id: 1,
    name: 'Paramètres du compte',
    icon: <SettingsIcon />,
    dark_icon: <DarkSettingsIcon />,
    route: 'account-settings'
  },
  {
    id: 2,
    name: 'Dark Mode',
    icon: <ModeIcon />,
    dark_icon: <DarkModeIcon />,
    isSwitch: true
  },
  {
    id: 3,
    name: 'Support',
    icon: <SupportIcon />,
    dark_icon: <DarkSupportIcon />,
    route: 'support'
  }
  // Les sections Adresse, Moyens de paiement et Offres ont été supprimées
];

const Profile_section3 = () => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  const handleNavigation = (item) => {
    if (item.route) {
      router.push(item.route);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.color3 }]}>Paramètres</Text>
      <View style={[styles.profile_data_container, { backgroundColor: theme.cardbg, shadowColor: darkMode ? '#000' : '#ccc' }]}>
        {profile_data.map((item, index) => (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => !item.isSwitch && handleNavigation(item)}
              disabled={item.isSwitch}
            >
              <View style={styles.row_left}>
                <View style={[styles.iconContainer, { backgroundColor: darkMode ? 'rgba(131, 110, 254, 0.15)' : '#f0f0ff' }]}>
                  {darkMode ? item.dark_icon : item.icon}
                </View>
                <Text style={[styles.row_text, { color: theme.color3 }]}>{item.name}</Text>
              </View>
              
              {item.isSwitch ? (
                <Switch
                  trackColor={{ false: "#767577", true: "#836EFE" }}
                  thumbColor={darkMode ? "#f4f3f4" : "#f4f3f4"}
                  onValueChange={toggleTheme}
                  value={darkMode}
                  style={styles.switch}
                />
              ) : (
                <ArrowIcon width={16} height={16} color={darkMode ? "#ccc" : "#666"} />
              )}
            </TouchableOpacity>
            
            {index < profile_data.length - 1 && (
              <View style={[styles.divider, { backgroundColor: darkMode ? '#333' : '#eee' }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default Profile_section3;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 10,
    marginBottom: 10,
  },
  profile_data_container: {
    borderRadius: 16,
    backgroundColor: '#F1F1F1',
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  row_left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#f0f0ff',
  },
  row_text: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#000000',
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 64,
    marginRight: 16,
  },
});