import React, { useContext } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import Pagination from '../../Pagination/Pagination';
import ThemeContext from '../../../theme/ThemeContext';
import { SourceSansPro_400Regular } from '@expo-google-fonts/source-sans-pro';

const Index2 = ({ theme, pages, activePageIndex, headingOpacity, descriptionOpacity, paginationOpacity }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <View style={styles.onboard_content}>
      <Animated.Text style={[[styles.heading, {color:theme.color}], { opacity: headingOpacity }]}>
        {pages[activePageIndex].heading}
      </Animated.Text>
      <Animated.View style={{ opacity: paginationOpacity || 1 }}>
        <Pagination activePageIndex={activePageIndex} totalPages={pages.length} activeDotBackgroundColor="#FFC444" dotWidth={20} activeDotwidth={40} />
      </Animated.View>
    </View>
  );
};

export default Index2;

const styles = StyleSheet.create({
  onboard_content: {
    position: 'absolute',
    backgroundColor: 'transparent',
    bottom: 120,
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 22,
    lineHeight: 30,
    color: '#39335E',
    textAlign: 'center',
    paddingBottom: 20,
  },
});