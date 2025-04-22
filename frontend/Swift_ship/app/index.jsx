import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { View, StyleSheet, Dimensions, ScrollView, StatusBar, Animated, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { pages } from "../components/Data/Data";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import ThemeContext from "../theme/ThemeContext";
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_400Regular, Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat";
import Index2 from "../components/Index/Index2/Index2";
import Index3 from "../components/Index/Index3/Index3";
import { SourceSansPro_400Regular, SourceSansPro_600SemiBold, SourceSansPro_700Bold } from "@expo-google-fonts/source-sans-pro";

const { width } = Dimensions.get('window');
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { theme,  darkMode } = useContext(ThemeContext);
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