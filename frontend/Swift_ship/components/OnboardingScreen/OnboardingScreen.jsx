// OnboardingScreen.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { pages } from './data'; // Adjust the path based on your file structure

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  return (
    <View style={styles.container}>
      {pages.map(page => (
        <View key={page.id} style={styles.page}>
          <LottieView 
            source={page.image}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="cover"
          />
          <Text style={styles.heading}>{page.heading}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lottieAnimation: {
    width: width * 0.8,
    height: width * 0.8, 
  },
  heading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    color: '#333333',
  },
});

export default OnboardingScreen;
