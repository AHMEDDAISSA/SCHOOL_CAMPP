import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { View, StyleSheet, Dimensions, ScrollView, StatusBar, Animated, Image, Text } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { pages } from "../components/Data/Data";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import ThemeContext from "../theme/ThemeContext";
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_400Regular, Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat";
import Index2 from "../components/Index/Index2/Index2";
import Index3 from "../components/Index/Index3/Index3";
import { SourceSansPro_400Regular, SourceSansPro_600SemiBold, SourceSansPro_700Bold } from "@expo-google-fonts/source-sans-pro";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const { width } = Dimensions.get('window');
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { theme, darkMode } = useContext(ThemeContext);
  const navigation = useNavigation();
  const swiperRef = useRef(null);
  const totalPages = pages.length;
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [fontsLoaded] = useFonts({
    SourceSansPro_400Regular,
    Montserrat_700Bold,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_400Regular,
    Montserrat_800ExtraBold,
    SourceSansPro_700Bold,
    SourceSansPro_600SemiBold,
  });

  // Custom toast configuration
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ 
          borderLeftColor: '#4CAF50', 
          backgroundColor: theme.background,
          borderRadius: 8,
          borderLeftWidth: 6,
          paddingVertical: 10,
          minHeight: 60
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'Montserrat_700Bold',
          color: '#4CAF50'
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Montserrat_500Medium',
          color: theme.color3
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ 
          borderLeftColor: '#FF0000', 
          backgroundColor: theme.background,
          borderRadius: 8,
          borderLeftWidth: 6,
          paddingVertical: 10,
          minHeight: 60
        }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'Montserrat_700Bold',
          color: '#FF0000'
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Montserrat_500Medium',
          color: theme.color3
        }}
      />
    ),
    // Custom toast to match the image provided
    customError: ({ text1, text2, props, ...rest }) => (
      <View style={{
        width: '90%',
        backgroundColor: theme.background,
        borderRadius: 8,
        borderLeftWidth: 6,
        borderLeftColor: '#FF0000',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontFamily: 'Montserrat_700Bold', 
            fontSize: 16, 
            color: '#FF0000',
            marginBottom: 5
          }}>
            {text1}
          </Text>
          <Text style={{ 
            fontFamily: 'Montserrat_500Medium', 
            fontSize: 14, 
            color: theme.color3 
          }}>
            {text2}
          </Text>
        </View>
      </View>
    )
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const headingOpacity = useRef(new Animated.Value(1)).current;
  const descriptionOpacity = useRef(new Animated.Value(1)).current;
  const paginationOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded) {
      animateContent();
    }
  }, [activePageIndex, fontsLoaded]);

  const animateContent = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headingOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(descriptionOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(headingOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(descriptionOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ])
    ]).start();
  };

  const handleImageScroll = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActivePageIndex(pageIndex);
  };

  const handleNextPress = () => {
    const nextIndex = Math.min(activePageIndex + 1, totalPages - 1);
    swiperRef.current.scrollTo({ x: nextIndex * width, animated: true });
    setActivePageIndex(nextIndex);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.safearea, { backgroundColor: theme.background }]} onLayout={onLayoutRootView}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={darkMode? "light-content" : 'dark-content'}
      />
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={swiperRef}
        onScroll={handleImageScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: width * totalPages }}
        style={{ flex: 1 }}
      >
        {pages.map((page, index) => (
          <View key={index} style={[styles.page, { width }]}>
            <View style={index === 1 ? styles.imagecontainer2 : styles.imageContainer}>
              <Image source={page.image} alt="images" style={index === 1 ? styles.Img2 : styles.image} />
            </View>
          </View>
        ))}
      </ScrollView>
      <Index2
        theme={theme}
        pages={pages}
        activePageIndex={activePageIndex}
        headingOpacity={headingOpacity}
        descriptionOpacity={descriptionOpacity}
        paginationOpacity={paginationOpacity}
      />
      <Index3
        activePageIndex={activePageIndex}
        totalPages={totalPages}
        handleNextPress={handleNextPress}
      />
      
      {/* Add the Toast component at the root level */}
      <Toast config={toastConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  page: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    maxHeight: 492,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  imagecontainer2: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    height: 350,
    width: 300,
  },
  Img2: {
    height: 270,
    width: 340,
    marginTop: "30%",
  },
});
