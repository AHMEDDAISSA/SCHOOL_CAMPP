import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import React, { useContext, useState } from 'react';
import Profile_img from "../../assets/images/profil33.png";
import Notification from "../../assets/images/notification.svg";
import Gants from "../../assets/images/Gants de ski.jpg";
import bonnet from "../../assets/images/Bonnet.jpg";
import kit from "../../assets/images/ski_k.jpg";
import Chaussure from "../../assets/images/Chaussure.jpg";
import Dark_Notification from "../../assets/images/dark_notification.svg";
import { Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import Home_section2 from '../../components/Home/Home_section2/Home_section2';
import Home_section3 from '../../components/Home/Home_section3/Home_section3';
import Home_section4 from '../../components/Home/Home_section4/Home_section4';
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const Home = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    
    const [recentAnnounces, setRecentAnnounces] = useState([
      {
        id: '1',
        title: 'Gants de ski taille 8',
        category: 'Prêter',
        type: 'Équipement ski',
        image: Gants,
        date: '20/04/2025'
      },
      {
        id: '2',
        title: 'Bonnet rouge enfant',
        category: 'Donner',
        type: 'Vêtement hiver',
        image: bonnet,
        date: '19/04/2025'
      },
      {
        id: '3',
        title: 'Chaussures de randonnée T36',
        category: 'Échanger',
        type: 'Chaussures',
        image: Chaussure,
        date: '18/04/2025'
      },
      {
        id: '4',
        title: 'Kit de Ski',
        category: 'Louer',
        type: 'Combinaison de ski ',
        image: kit,
        date: '18/04/2025'
      },
    ]);
    
    const categories = [
      { id: '1', name: 'Donner', icon: 'gift-outline' },
      { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
      { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
      { id: '4', name: 'Louer', icon: 'cash-outline' },
      { id: '5', name: 'Acheter', icon: 'cart-outline' }
    ];
    
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <StatusBar translucent backgroundColor="transparent" barStyle={darkMode ? "light-content" : 'dark-content'} />

        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.header_left}>
            <Image source={Profile_img} style={styles.profile} />
            <View style={styles.content}>
              <Text style={styles.heading_text}>Bienvenue à l'école de La Brillaz! 👋🏻</Text>
              <Text style={[styles.heading, {color: theme.color}]}> Ahmed Aissa</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notification_box} onPress={() => {router.push('(screens)/notification')}}>
            {darkMode ? <Dark_Notification style={styles.notification} /> : <Notification style={styles.notification} />}
            <View style={styles.circle}>
              <Text style={styles.notification_count}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Bannière Bourse */}
          <View style={styles.bourseHeader}>
            <Text style={styles.bourseTitle}>Bourse au prêt</Text>
            <Text style={styles.bourseSubtitle}>Échangez, prêtez, donnez pour les camps de ski et camps verts</Text>
          </View>

          {/* Bouton publier une annonce */}
          <TouchableOpacity style={styles.publishButton} onPress={() => {router.push('(tabs)/Annonces')}}>
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.publishButtonText}>Publier une annonce</Text>
          </TouchableOpacity>

          {/* Filtres Catégories */}
          <Text style={[styles.sectionTitle, {color: theme.color}]}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity 
                key={category.id}
                style={[
                  styles.categoryButton, 
                  { backgroundColor: darkMode ? '#363636' : '#F0F0F0' }
                ]}
                onPress={() => {router.push(`(screens)/categorie/${category.name}`)}}
              >
                <View style={[
                  styles.categoryIconContainer,
                  { backgroundColor: darkMode ? '#5D5FEF' : '#E6E6FA' }
                ]}>
                  <Ionicons name={category.icon} size={20} color={darkMode ? '#FFFFFF' : '#5D5FEF'} />
                </View>
                <Text style={[styles.categoryText, {color: darkMode ? '#FFFFFF' : '#39335E'}]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Annonces récentes */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, {color: theme.color}]}>Annonces récentes</Text>
              <TouchableOpacity onPress={() => {router.push('(screens)/toutes-annonces')}}>
                <Text style={styles.seeAllText}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {recentAnnounces.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.announceCard,
                  { backgroundColor: darkMode ? '#363636' : '#F9F9F9' }
                ]}
                onPress={() => {router.push(`(screens)/annonce/${item.id}`)}}
              >
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.categoryBadgeWrapper}>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: darkMode ? '#FFFFFF' : '#39335E' }]}>{item.title}</Text>
                  <Text style={[styles.cardType, { color: darkMode ? '#B0B0B0' : '#727272' }]}>{item.type}</Text>
                  <Text style={[styles.cardDate, { color: darkMode ? '#808080' : '#9B9B9B' }]}>{item.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* S'abonner */}
          <TouchableOpacity style={styles.subscribeButton} onPress={() => {router.push('(screens)/#')}}>
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.subscribeButtonText}>S'abonner aux nouvelles annonces</Text>
          </TouchableOpacity>

          {/* Sections supplémentaires */}
          <Home_section2 />
          <Home_section3 />
          <Home_section4 />
        </ScrollView>
      </View>
    );
};

export default Home;
//new one and all is on work 
const styles = StyleSheet.create({
  container: {
      paddingTop: 50,
      paddingHorizontal: 20,
      flex: 1,
  },
  header: {
      flexDirection: 'row',
      alignItems:'center',
      justifyContent: 'space-between',
  },
  header_left:{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  profile: {
      width: 65,
      height: 65,
  },
  heading_text: {
      fontSize: 12,
      lineHeight: 14,
      fontFamily: 'Montserrat_500Medium',
      color: '#727272',
      textTransform: 'capitalize',
  },
  heading: {
      fontSize: 18,
      lineHeight: 22,
      fontFamily: 'Montserrat_700Bold',
      color: '#39335E',
      textTransform: 'capitalize',
  },
  notification_box: {

  },
  notification: {
      position:'relative',
  },
  circle: {
      position: 'absolute',
      width: 15,
      height: 15,
      alignItems:'center',
      justifyContent: 'center',
      backgroundColor: '#EB001B',
      borderRadius: 50,
      right: -3,
      top: -3,
  },
  notification_count: {
      fontSize: 8,
      lineHeight: 12,
      fontFamily: 'Montserrat_600SemiBold',
      color: '#FFFFFF',
  },
  
  // Nouveaux styles
  bourseHeader: {
      marginTop: 20,
      backgroundColor: '#39335E',
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
  },
  bourseTitle: {
      fontSize: 22,
      fontFamily: 'Montserrat_700Bold',
      color: '#FFFFFF',
      marginBottom: 5,
  },
  bourseSubtitle: {
      fontSize: 14,
      fontFamily: 'Montserrat_500Medium',
      color: '#FFFFFF',
      opacity: 0.9,
  },
  publishButton: {
      backgroundColor: '#EB001B',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
  },
  publishButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 16,
      marginLeft: 10,
  },
  sectionTitle: {
      fontSize: 18,
      fontFamily: 'Montserrat_700Bold',
      color: '#39335E',
      marginBottom: 10,
  },
  categoriesContainer: {
      flexDirection: 'row',
      marginBottom: 20,
  },
  categoryButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#F0F0F0',
      marginRight: 10,
      alignItems: 'center',
      minWidth: 100,
      flexDirection: 'row',
      justifyContent: 'flex-start',
  },
  categoryIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#E6E6FA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
  },
  categoryText: {
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 12,
  },
  recentSection: {
      marginBottom: 20,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
  },
  seeAllText: {
      color: '#EB001B',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 14,
  },
  announceCard: {
      backgroundColor: '#F9F9F9',
      borderRadius: 10,
      marginBottom: 15,
      overflow: 'hidden',
      flexDirection: 'row',
      shadowColor: "#000",
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
  },
  cardImageContainer: {
      width: 80,
      height: 80,
      backgroundColor: '#E0E0E0',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
  },
  categoryBadge: {
      backgroundColor: '#39335E',
      color: 'white',
      fontSize: 10,
      fontFamily: 'Montserrat_600SemiBold',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      margin: 5,
  },
  cardContent: {
      padding: 10,
      flex: 1,
  },
  cardTitle: {
      fontSize: 16,
      fontFamily: 'Montserrat_600SemiBold',
      color: '#39335E',
      marginBottom: 5,
  },
  cardType: {
      fontSize: 12,
      fontFamily: 'Montserrat_500Medium',
      color: '#727272',
  },
  cardDate: {
      fontSize: 11,
      fontFamily: 'Montserrat_500Medium',
      color: '#9B9B9B',
      marginTop: 5,
  },
  subscribeButton: {
      backgroundColor: '#39335E',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 20,
  },
  subscribeButtonText: {
      color: '#FFFFFF',
      fontFamily: 'Montserrat_600SemiBold',
      fontSize: 14,
      marginLeft: 10,
  },
  cardImageWrapper: {
      position: 'relative',
      width: 80,
      height: 80,
    },
    cardImage: {
      width: '100%',
      height: '100%',
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
    },
    categoryBadgeWrapper: {
      position: 'absolute',
      top: 5,
      left: 5,
      backgroundColor: '#39335E',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    
})