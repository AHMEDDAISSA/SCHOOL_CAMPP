// PagedOnboardingScreen.js
import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { pages } from './data'; // Adjust the path based on your file structure

const { width, height } = Dimensions.get('window');

const PagedOnboardingScreen = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.pageContainer}>
        <LottieView 
          source={item.image}
          autoPlay
          loop
          style={styles.lottieAnimation}
          resizeMode="cover"
        />
        <Text style={styles.heading}>{item.heading}</Text>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex + 1,
        animated: true
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last page, call onFinish to proceed to the next screen
      onFinish && onFinish();
    }
  };

  const handleSkip = () => {
    onFinish && onFinish();
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
      
      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.button}>
          <Text style={styles.buttonText}>Passer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext} style={[styles.button, styles.primaryButton]}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            {currentIndex === pages.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pageContainer: {
    width,
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
    marginHorizontal: 30,
    fontWeight: '600',
    color: '#333333',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#CCCCCC',
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  button: {
    padding: 12,
  },
  buttonText: {
    fontSize: 16,
    color: '#666666',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PagedOnboardingScreen;
