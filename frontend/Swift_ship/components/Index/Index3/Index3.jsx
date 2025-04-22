import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { router, Link } from "expo-router";
import ThemeContext from '../../../theme/ThemeContext';

const Index3 = ({ activePageIndex, totalPages, handleNextPress }) => {
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const handleCreateAccountPress = () => {
    router.push('lets'); 
  };
  return (
    <View style={styles.page_button_container}>
      {activePageIndex === totalPages - 1 ? (
        <View>
          <TouchableOpacity style={styles.nextButton} onPress={handleCreateAccountPress}>
           <Text style={styles.button_text}>Suivant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={handleNextPress} style={styles.nextButton}>
          <Text style={styles.button_text}>Suivant</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Index3;

const styles = StyleSheet.create({
  page_button_container: {
    paddingHorizontal: 20,
    marginBottom: 50,    
  },
  nextButton: {
    backgroundColor: '#836EFE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  button_text: {
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  }
});
