import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import Home from "../../assets/images/home.svg";
import Myorders from "../../assets/images/annonce4.svg";
import Inbox from "../../assets/images/inbox.svg";
import Profiles from "../../assets/images/profile.svg";
import Active_Home from "../../assets/images/dark_home.svg";
import Active_Myorders from "../../assets/images/darkmode_annonce.svg";
import Active_Inbox from "../../assets/images/dark_inbox.svg";
import Active_Profiles from "../../assets/images/dark_profile.svg";
import ThemeContext from '../../theme/ThemeContext';

const TabBarButton = ({ children, onPress, accessibilityState, title }) => {
  const { theme } = useContext(ThemeContext);
  const isSelected = accessibilityState.selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        isSelected ? styles.activeTabButton : null,
      ]}
    >
      <View style={[styles.iconContainer, isSelected ? styles.activeIconContainer : null]}>
        {children}
        <Text style={[[styles.title, {color:theme.color5}], isSelected ? styles.activeTitle : null]}>
        {title}
      </Text>
      </View>
    </TouchableOpacity>
  );
};

const TabsLayout = () => {
  const { theme, darkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarButton: (props) => (
            <TabBarButton {...props} title={route.name} />
          ),
          tabBarStyle: [styles.tabBar, { backgroundColor: theme.background }],
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let IconComponent;
            switch (route.name) {
              case 'home':
                IconComponent = darkMode ? Active_Home : (focused ? Active_Home : Home);
                break;
              case 'Annonces':
                IconComponent = darkMode ? Active_Myorders : (focused ? Active_Myorders : Myorders);
                break;
              case 'inbox':
                IconComponent = darkMode ? Active_Inbox : (focused ? Active_Inbox : Inbox);
                break;
              case 'profile':
                IconComponent = darkMode ? Active_Profiles : (focused ? Active_Profiles : Profiles);
                break;
              default:
                IconComponent = null;
                break;
            }
            return IconComponent ? <IconComponent /> : null;
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="Annonces"
          options={{
            title: 'Annonces',
          }}
        />
        <Tabs.Screen
          name="inbox"
          options={{
            title: 'Inbox',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tabBar: {
    width: '100%',
    maxHeight: 85,
    height: '100%',
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  iconContainer: {
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
    maxHeight: 48,
    gap: 15,
  },
  activeIconContainer: {
    backgroundColor: '#836EFE',
  },
  title: {
    fontSize: 8,
    lineHeight: 9,
    color: '#474D66',
    marginVertical: -10,
    textTransform: 'capitalize',
  },
  activeTitle: {
    color: '#ffffff',
  },
  activeTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabsLayout;
