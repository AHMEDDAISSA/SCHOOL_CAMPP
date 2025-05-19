import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Dimensions, Alert, Switch, BackHandler, FlatList, RefreshControl, TextInput } from 'react-native';
import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import Notification from "../../assets/images/notification.svg";
import Dark_Notification from "../../assets/images/dark_notification.svg";
import { router } from "expo-router";
import ThemeContext from '../../theme/ThemeContext';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AnnonceContext from '../../contexts/AnnonceContext';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { AuthContext } from '../../services/AuthContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';


const AnnonceCard = React.memo(({ item, darkMode, onPress, onDelete }) => (
  <TouchableOpacity 
    style={[
      styles.announceCard,
      { backgroundColor: darkMode ? '#363636' : '#F9F9F9' }
    ]}
    onPress={onPress}
    accessible={true}
    accessibilityLabel={`Annonce: ${item.title}`}
    accessibilityHint="Appuyez pour voir les détails de l'annonce"
    accessibilityRole="button"
  >
    <View style={[
      styles.cardImageContainer,
      { backgroundColor: darkMode ? '#444444' : '#E0E0E0' }
    ]}>
      {(item.imageUrl || (item.images && item.images.length > 0)) ? (
        <Image 
          source={{ uri: item.imageUrl || item.images[0] }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImageContainer}>
          <Ionicons 
            name={getCategoryIcon(item.category)} 
            size={30} 
            color={darkMode ? '#666666' : '#CCCCCC'} 
          />
        </View>
      )}
      <View style={[
        styles.categoryBadgeContainer, 
        {backgroundColor: getCategoryColor(item.category)}
      ]}>
        <Text style={styles.categoryBadge}>{item.category}</Text>
      </View>
    </View>
    <View style={styles.cardContent}>
      <Text style={[
        styles.cardTitle, 
        { color: darkMode ? '#FFFFFF' : '#39335E' }
      ]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[
        styles.cardType, 
        { color: darkMode ? '#AAAAAA' : '#666666' }
      ]}>
        {item.type}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[
          styles.cardDate, 
          { color: darkMode ? '#AAAAAA' : '#666666' }
        ]}>
          {formatDate(item.date)}
        </Text>
        
        {/* Bouton de suppression */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation(); // Empêcher la propagation vers la carte
            onDelete(item._id); // Assurez-vous d'utiliser _id et non id
          }}
          accessible={true}
          accessibilityLabel="Supprimer l'annonce"
          accessibilityHint="Appuyez pour supprimer cette annonce"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={14} color="white" />
          <Text style={styles.deleteButtonText}>Effacer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
));

// Fonctions utilitaires pour les annonces
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Donner': return 'gift-outline';
    case 'Prêter': return 'swap-horizontal-outline';
    case 'Emprunter': return 'hand-left-outline';
    case 'Louer': return 'cash-outline';
    case 'Acheter': return 'cart-outline';
    case 'Échanger': return 'repeat-outline';
    default: return 'document-outline';
  }
};

const getCategoryColor = (category) => {
  switch(category) {
    case 'Donner': return '#4CAF50';
    case 'Prêter': return '#2196F3';
    case 'Emprunter': return '#FF9800';
    case 'Louer': return '#9C27B0';
    case 'Acheter': return '#F44336';
    case 'Échanger': return '#009688';
    default: return '#39335E';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  
  // Vérifier si le format est correct
  const today = new Date();
  const date = new Date(dateString);
  
  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }
  
  // Check if it's yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  }
  
  // Otherwise return formatted date
  return date.toLocaleDateString('fr-FR');
};

const AdminDashboard = () => {
  const { theme, darkMode, profileData } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  
  // Utiliser le contexte AnnonceContext pour accéder aux annonces et fonctions
  const { annonces, loading, refreshAnnonces, deleteAnnonce, cleanOldAnnonces, updateNewStatus } = useContext(AnnonceContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'annonces', 'users', 'settings'
  const [selectedCategory, setSelectedCategory] = useState('0'); // Catégorie sélectionnée
  const [searchQuery, setSearchQuery] = useState('');
  const screenWidth = Dimensions.get('window').width - 32;
  
  // Navigation hook inside the component
  const navigation = useNavigation();
    
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Déconnexion", 
          onPress: async () => {
            try {
              const success = await logout();
              if (success) {
                router.replace('/login');
                Toast.show({
                  type: 'success',
                  text1: 'Déconnexion réussie',
                  visibilityTime: 2000
                });
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Erreur de déconnexion',
                text2: error.message,
                visibilityTime: 3000
              });
            }
          }
        }
      ]
    );
  };

  const generatePDF = async () => {
    // Afficher le chargement
    Toast.show({
      type: 'info',
      text1: 'Génération du PDF en cours...',
      visibilityTime: 2000,
    });

    try {
      // Date pour le nom du fichier
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      // Création du contenu HTML pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Bourse au prêt - Sauvegarde des données</title>
            <style>
              body {
                font-family: 'Helvetica', Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 20px;
              }
              h1 {
                color: #39335E;
                text-align: center;
                margin-bottom: 30px;
              }
              h2 {
                color: #5D5FEF;
                margin-top: 30px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              th, td {
                text-align: left;
                padding: 8px;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .category {
                font-weight: bold;
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                color: white;
              }
              .category-donner { background-color: #4CAF50; }
              .category-preter { background-color: #2196F3; }
              .category-emprunter { background-color: #FF9800; }
              .category-louer { background-color: #9C27B0; }
              .category-acheter { background-color: #F44336; }
              .category-echanger { background-color: #009688; }
              .footer {
                text-align: center;
                margin-top: 40px;
                font-size: 12px;
                color: #666;
              }
              .stats-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
                margin-bottom: 20px;
              }
              .stat-box {
                width: 45%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                text-align: center;
              }
              .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #5D5FEF;
                margin: 5px 0;
              }
              .stat-label {
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>Bourse au prêt - Sauvegarde des données</h1>
            <p><strong>Date:</strong> ${today.toLocaleDateString()}</p>
            
            <h2>Statistiques générales</h2>
            <div class="stats-container">
              <div class="stat-box">
                <div class="stat-number">${totalAnnounces}</div>
                <div class="stat-label">Annonces totales</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${annoncesToModerate.length}</div>
                <div class="stat-label">Annonces à modérer</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${totalUsers}</div>
                <div class="stat-label">Utilisateurs validés</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${pendingUsers}</div>
                <div class="stat-label">Utilisateurs en attente</div>
              </div>
            </div>

            <h2>Distribution par catégorie</h2>
            <table>
              <tr>
                <th>Catégorie</th>
                <th>Nombre d'annonces</th>
              </tr>
              ${categoryStats.map(stat => `
                <tr>
                  <td><span class="category category-${stat.name.toLowerCase()}">${stat.name}</span></td>
                  <td>${stat.count}</td>
                </tr>
              `).join('')}
            </table>

            <h2>Liste des annonces</h2>
            <table>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
              ${annonces.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.category}</td>
                  <td>${item.type || 'N/A'}</td>
                  <td>${formatDate(item.date) || 'N/A'}</td>
                </tr>
              `).join('')}
            </table>

            <h2>Utilisateurs en attente de validation</h2>
            <table>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Date d'inscription</th>
              </tr>
              ${pendingUsersList.map(user => `
                <tr>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
                  <td>${user.date}</td>
                </tr>
              `).join('')}
            </table>

            <h2>Annonces à modérer</h2>
            <table>
              <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Raison de signalement</th>
              </tr>
              ${annoncesToModerate.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.category}</td>
                  <td>${item.reason || 'Nouvelle annonce'}</td>
                </tr>
              `).join('')}
            </table>

            <div class="footer">
              <p>Document généré automatiquement le ${today.toLocaleDateString()} à ${today.toLocaleTimeString()}</p>
              <p>Bourse au prêt - Système d'administration</p>
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        // Pour le web, on utilise une méthode différente pour créer et télécharger le PDF
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bourse_au_pret_sauvegarde_${dateString}.html`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Toast.show({
          type: 'success',
          text1: 'Sauvegarde générée',
          text2: 'Le fichier a été téléchargé avec succès.',
          visibilityTime: 2000,
        });
      } else {
        // Pour les plateformes mobiles
        // Option 1: Utiliser react-native-print pour afficher directement le PDF
        try {
          await Print.printAsync({
            html: htmlContent,
          });
          
          Toast.show({
            type: 'success',
            text1: 'PDF généré',
            text2: 'Vous pouvez maintenant l\'enregistrer ou le partager',
            visibilityTime: 3000,
          });
        } 
        // Option 2: Si Print ne fonctionne pas, utiliser RNHTMLtoPDF
        catch (printError) {
          console.log('Print failed, falling back to PDF generation', printError);
          
          const options = {
            html: htmlContent,
            fileName: `bourse_au_pret_sauvegarde_${dateString}`,
            directory: 'Documents',
          };

          const file = await RNHTMLtoPDF.convert(options);
          
          if (file.filePath) {
            // Partager le fichier PDF
            await Share.open({
              url: `file://${file.filePath}`,
              title: 'Sauvegarde des données Bourse au prêt',
              message: 'Voici la sauvegarde des données de l\'application Bourse au prêt.',
              type: 'application/pdf',
            });
            
            Toast.show({
              type: 'success',
              text1: 'PDF généré avec succès',
              text2: `Sauvegardé dans: ${file.filePath}`,
              visibilityTime: 3000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur de génération du PDF',
        text2: error.message || 'Une erreur est survenue',
        visibilityTime: 3000,
      });
    }
  };

  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_500Medium,
  });
    
  useEffect(() => {
    const refreshData = async () => {
    await refreshAnnonces();
    // Mettre à jour les annonces à modérer après chaque rafraîchissement
    setAnnoncesToModerate(getAnnoncesToModerate());
  };
  
  refreshData();
  
  // Configurer un rafraîchissement périodique si nécessaire
  const refreshInterval = setInterval(() => {
    refreshData();
  }, 300000); // Rafraîchir toutes les 5 minutes
  
  return () => clearInterval(refreshInterval);

    const backAction = () => {
      Alert.alert(
        "Confirmation", 
        "Voulez-vous vraiment quitter et retourner à la page précédente ?",
        [
          {
            text: "Annuler",
            onPress: () => null,
            style: "cancel"
          },
          { 
            text: "Oui", 
            onPress: () => router.back() 
          }
        ]
      );
      return true; 
    };

    const backHandler = BackHandler.addEventListener( /**linaa sarr un petit changement  */
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const [categoryStats, setCategoryStats] = useState([
    { name: 'Donner', count: 15, color: '#4CAF50' },
    { name: 'Prêter', count: 12, color: '#2196F3' },
    { name: 'Emprunter', count: 8, color: '#FF9800' },
    { name: 'Louer', count: 4, color: '#9C27B0' },
    { name: 'Acheter', count: 2, color: '#F44336' },
    { name: 'Échanger', count: 1, color: '#009688' }
  ]);

  useEffect(() => {
    if (annonces && annonces.length > 0) {
      // Initialiser un objet pour compter les annonces par catégorie
      const categoryCounts = {
        'Donner': 0,
        'Prêter': 0,
        'Emprunter': 0,
        'Louer': 0,
        'Acheter': 0,
        'Échanger': 0
      };
      
      // Compter les annonces par catégorie
      annonces.forEach(annonce => {
        if (categoryCounts.hasOwnProperty(annonce.category)) {
          categoryCounts[annonce.category]++;
        }
      });
      
      const updatedCategoryStats = [
        { name: 'Donner', count: categoryCounts['Donner'], color: '#4CAF50' },
        { name: 'Prêter', count: categoryCounts['Prêter'], color: '#2196F3' },
        { name: 'Emprunter', count: categoryCounts['Emprunter'], color: '#FF9800' },
        { name: 'Louer', count: categoryCounts['Louer'], color: '#9C27B0' },
        { name: 'Acheter', count: categoryCounts['Acheter'], color: '#F44336' },
        { name: 'Échanger', count: categoryCounts['Échanger'], color: '#009688' }
      ];
      
      // Filtrer pour n'afficher que les catégories qui ont au moins une annonce
      const filteredStats = updatedCategoryStats.filter(cat => cat.count > 0);
      
      // Mettre à jour l'état
      setCategoryStats(filteredStats.length > 0 ? filteredStats : updatedCategoryStats);
    }
  }, [annonces]);

  const [visitStats, setVisitStats] = useState([13]);

  useEffect(() => {
    // Créer des données de visites basées sur le nombre d'annonces
    if (annonces && annonces.length > 0) {
      const baseVisits = Math.max(5, Math.floor(annonces.length / 2));
      const visitVariation = () => Math.floor(Math.random() * baseVisits);
      
      const weekVisits = [
        baseVisits + visitVariation(),
        baseVisits + visitVariation(),
        baseVisits + visitVariation(),
        baseVisits + 2 * visitVariation(),
        baseVisits + 2 * visitVariation(),
        baseVisits - Math.floor(visitVariation() / 2),
        baseVisits - Math.floor(visitVariation() / 2)
      ];
      
      setVisitStats(weekVisits);
    }
  }, [annonces]);

 
  const getAnnoncesToModerate = useCallback(() => {
    if (!annonces || annonces.length === 0) return [];
    
    // Filtrer les annonces qui ont le statut "needsModeration" ou qui sont nouvelles (dernières 24h)
    return annonces.filter(annonce => {
      // Vérifier si l'annonce a été marquée pour modération
      if (annonce.needsModeration) return true;
      
      // Vérifier si l'annonce est nouvelle (créée dans les dernières 24h)
      const creationDate = new Date(annonce.date);
      const now = new Date();
      const timeDifference = now - creationDate;
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      return hoursDifference <= 24;
  }).map(annonce => ({
    ...annonce,
    reason: annonce.needsModeration ? 
      (annonce.reason || "Nouvelle annonce nécessitant modération") : 
      "Annonce récente (dernières 24h)"
  }));
}, [annonces]);

  // État pour les annonces à modérer
  const [annoncesToModerate, setAnnoncesToModerate] = useState([]);

  // Mettre à jour les annonces à modérer quand les annonces changent
  useEffect(() => {
    setAnnoncesToModerate(getAnnoncesToModerate());
  }, [annonces, getAnnoncesToModerate]);

  // États pour les données d'administration
  const [pendingUsers, setPendingUsers] = useState(7);
  const [totalUsers, setTotalUsers] = useState(4);
  
  // États pour les utilisateurs en attente de validation
  const [pendingUsersList, setPendingUsersList] = useState([
    { id: 'u1', name: 'Thomas Leroux', email: 'thomas.l@gmail.com', date: '04/05/2025', status: 'En attente' },
    { id: 'u2', name: 'Claire Fontaine', email: 'claire.f@gmail.com', date: '03/05/2025', status: 'En attente' },
    { id: 'u3', name: 'Marc Dubois', email: 'marc.d@gmail.com', date: '02/05/2025', status: 'En attente' },
    { id: 'u4', name: 'Julie Moreau', email: 'julie.m@gmail.com', date: '01/05/2025', status: 'En attente' },
    { id: 'u5', name: 'Luc Bernard', email: 'luc.b@gmail.com', date: '30/04/2025', status: 'En attente' },
    { id: 'u6', name: 'Sophie Moreau', email: 'sophie.m@gmail.com', date: '29/04/2025', status: 'En attente' },
    { id: 'u7', name: 'Paul Girard', email: 'paul.g@gmail.com', date: '28/04/2025', status: 'En attente' },
  ]);
    
  // Fonction pour rafraîchir les données
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAnnonces();
      await updateNewStatus();
      // Mettre à jour les annonces à modérer après le rafraîchissement
      setAnnoncesToModerate(getAnnoncesToModerate());
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAnnonces, updateNewStatus, getAnnoncesToModerate]);
    
  // Nombre total d'annonces
  const [totalAnnounces, setTotalAnnounces] = useState(0);
    
  // Actualiser le nombre total d'annonces
  useEffect(() => {
    if (annonces) {
      setTotalAnnounces(annonces.length);
    }
  }, [annonces]);
    
  const profileImage = profileData && profileData.profileImage 
    ? { uri: profileData.profileImage } 
    : require('../../assets/images/placeholder.png');

  const adminName = profileData && profileData.fullName 
    ? profileData.fullName 
    : 'Administrateur';
    
  // Filter annonces based on category and search
  const filteredAnnonces = useMemo(() => {
    if (!annonces || annonces.length === 0) return [];
    
    return annonces.filter(item => {
      const matchesCategory = selectedCategory === '0' || 
        item.category === categories.find(cat => cat.id === selectedCategory)?.name;
      
      const matchesSearch = !searchQuery || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [annonces, selectedCategory, searchQuery]);
    
  // Catégories de filtrage
  const categories = [
    { id: '0', name: 'Tous' },
    { id: '1', name: 'Donner', icon: 'gift-outline' },
    { id: '2', name: 'Prêter', icon: 'swap-horizontal-outline' },
    { id: '3', name: 'Emprunter', icon: 'hand-left-outline' },
    { id: '4', name: 'Louer', icon: 'cash-outline' },
    { id: '5', name: 'Acheter', icon: 'cart-outline' },
    { id: '6', name: 'Échanger', icon: 'repeat-outline' }
  ];

  // Fonction pour approuver un utilisateur
  const approveUser = (userId) => {
    Alert.alert(
      "Confirmer l'approbation",
      "Voulez-vous vraiment approuver cet utilisateur ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Approuver", 
          onPress: () => {
            // Logique d'approbation
            const updatedUsers = pendingUsersList.filter(user => user.id !== userId);
            setPendingUsersList(updatedUsers);
            setPendingUsers(pendingUsers - 1);
            setTotalUsers(totalUsers + 1);
            Toast.show({
              type: 'success',
              text1: 'Utilisateur approuvé',
              visibilityTime: 2000,
            });
          }
        }
      ]
    );
  };
    
  // Fonction pour rejeter un utilisateur
  const rejectUser = (userId) => {
    Alert.alert(
      "Confirmer le rejet",
      "Voulez-vous vraiment rejeter cet utilisateur ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Rejeter", 
          onPress: () => {
            // Logique de rejet
            const updatedUsers = pendingUsersList.filter(user => user.id !== userId);
            setPendingUsersList(updatedUsers);
            setPendingUsers(pendingUsers - 1);
            Toast.show({
              type: 'success',
              text1: 'Utilisateur rejeté',
              visibilityTime: 2000,
            });
          }
        }
      ]
    );
  };
    
  // Fonction pour approuver une annonce
  const approveAnnounce = (announceId) => {
  Alert.alert(
    "Approuver l'annonce",
    "Cette annonce sera approuvée et restera visible. Continuer ?",
    [
      {
        text: "Annuler",
        style: "cancel"
      },
      { 
        text: "Approuver", 
        onPress: async () => {
          try {
            // Trouver l'annonce à mettre à jour
            const annonceToUpdate = annonces.find(a => a._id === announceId || a.id === announceId);
            
            if (annonceToUpdate) {
              // Mettre à jour l'annonce localement
              const updatedAnnonce = { 
                ...annonceToUpdate, 
                needsModeration: false, 
                status: 'approved'
              };
              
              // Mettre à jour la liste des annonces
              const updatedAnnonces = annonces.map(a => 
                (a._id === announceId || a.id === announceId) ? updatedAnnonce : a
              );
              
              // Mettre à jour le contexte
              // Si vous avez une fonction updateAnnonce dans votre contexte
              await updateAnnonce(announceId, { needsModeration: false, status: 'approved' });
              
              // Mettre à jour la liste de modération
              const updatedModeration = annoncesToModerate.filter(announce => announce._id !== announceId && announce.id !== announceId);
              setAnnoncesToModerate(updatedModeration);
              
              Toast.show({
                type: 'success',
                text1: 'Annonce approuvée',
                visibilityTime: 2000,
              });
            }
          } catch (error) {
            console.error("Erreur lors de l'approbation:", error);
            Toast.show({
              type: 'error',
              text1: 'Erreur lors de l\'approbation',
              text2: error.message || 'Une erreur est survenue',
              visibilityTime: 3000,
            });
          }
        }
      }
    ]
  );
};
    
  // Fonction pour rejeter une annonce
  const rejectAnnounce = (announceId) => {
    Alert.alert(
      "Rejeter l'annonce",
      "Cette annonce sera supprimée définitivement. Continuer ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Supprimer", 
          onPress: async () => {
            try {
              // Appeler la fonction de suppression du contexte
              const success = await deleteAnnonce(announceId);
              
              if (success) {
                // Mettre à jour l'état local des annonces à modérer
                const updatedModeration = annoncesToModerate.filter(announce => announce._id !== announceId);
                setAnnoncesToModerate(updatedModeration);
                
                // Mettre à jour le nombre total d'annonces
                setTotalAnnounces(prev => prev - 1);
                
                Toast.show({
                  type: 'success',
                  text1: 'Annonce supprimée',
                  visibilityTime: 2000,
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur lors de la suppression',
                  text2: 'Veuillez réessayer',
                  visibilityTime: 2000,
                });
              }
            } catch (error) {
              console.error("Erreur lors du rejet de l'annonce:", error);
              Toast.show({
                type: 'error',
                text1: 'Erreur lors de la suppression',
                text2: error.message || 'Une erreur est survenue',
                visibilityTime: 3000,
              });
            }
          }
        }
      ]
    );
  };
    
  // Fonction pour supprimer une annonce
  const handleDeleteAnnonce = useCallback((id) => {
    Alert.alert(
      "Confirmation de suppression",
      "Êtes-vous sûr de vouloir supprimer cette annonce ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const announceId = id;

              // Appeler la fonction de suppression du contexte
              const success = await deleteAnnonce(id);
              
              // Afficher un message de succès ou d'erreur
              if (success) {
                Toast.show({
                  type: 'success',
                  text1: 'Annonce supprimée avec succès',
                  visibilityTime: 2000,
                });
                
                // Mettre à jour le nombre total d'annonces
                setTotalAnnounces(prev => prev - 1);
                
                // Mettre à jour les annonces à modérer si nécessaire
                setAnnoncesToModerate(prev => prev.filter(item => item._id !== announceId && item.id !== announceId));
                Toast.show({
                type: 'success',
                text1: 'Annonce supprimée avec succès',
                visibilityTime: 2000,
              });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur lors de la suppression',
                  text2: 'Veuillez réessayer',
                  visibilityTime: 2000,
                });
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Toast.show({
                type: 'error',
                text1: 'Erreur lors de la suppression',
                text2: error.message || 'Une erreur est survenue',
                visibilityTime: 3000,
              });
            }
          }
        }
      ]
    );
  }, [deleteAnnonce]);
    
  // Fonction pour réinitialiser le système
  const resetSystem = () => {
    Alert.alert(
      "Réinitialisation du système",
      "Cette action supprimera toutes les annonces et réinitialisera les statistiques. Cette action est irréversible et devrait être effectuée une fois par année scolaire. Voulez-vous continuer ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Réinitialiser", 
          onPress: () => {
            Alert.alert(
              "Confirmation finale",
              "Dernière vérification : êtes-vous absolument sûr de vouloir réinitialiser le système ?",
              [
                {
                  text: "Annuler",
                  style: "cancel"
                },
                {
                  text: "Réinitialiser",
                  onPress: async () => {
                    try {
                      // Réinitialisation des données
                      // Idéalement, cela appellerait une fonction du contexte pour nettoyer toutes les annonces
                      // AnnonceContext.resetAllAnnonces()
                      
                      setTotalAnnounces(0);
                      setAnnoncesToModerate([]);
                      setVisitStats([0, 0, 0, 0, 0, 0, 0]);
                      setCategoryStats([
                        { name: 'Donner', count: 0, color: '#4CAF50' },
                        { name: 'Prêter', count: 0, color: '#2196F3' },
                        { name: 'Emprunter', count: 0, color: '#FF9800' },
                        { name: 'Louer', count: 0, color: '#9C27B0' },
                        { name: 'Acheter', count: 0, color: '#F44336' },
                        { name: 'Échanger', count: 0, color: '#009688' }
                      ]);
                      
                      Toast.show({
                        type: 'success',
                        text1: 'Système réinitialisé pour la nouvelle année',
                        visibilityTime: 3000,
                      });
                    } catch (error) {
                      console.error('Erreur lors de la réinitialisation:', error);
                      Toast.show({
                        type: 'error',
                        text1: 'Erreur lors de la réinitialisation',
                        text2: error.message || 'Une erreur est survenue',
                        visibilityTime: 3000,
                      });
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };
    
  // Optimiser les fonctions de rendu pour la FlatList
  const keyExtractor = useCallback((item) => item._id?.toString() || Math.random().toString(), []);
    
  const renderItem = useCallback(({ item }) => (
    <AnnonceCard 
      item={item}
      darkMode={darkMode}
      onPress={() => router.push(`/annonce/${item._id}`)}
      onDelete={handleDeleteAnnonce}
    />
  ), [darkMode, handleDeleteAnnonce]);
    
  // Show loading indicator when fonts are loading or data is loading
  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color="#39335E" />
      </View>
    );
  }

  // Fonction de rendu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case 'annonces':
        return (
          <View style={styles.tabContent}>
            {/* En-tête avec filtre et recherche */}
            <View style={styles.announcesHeader}>
              <Text style={[styles.sectionTitle, {color: theme.color}]}>Liste des annonces</Text>
              <Text style={[styles.announcesCount, {color: darkMode ? '#888888' : theme.secondaryText}]}>
                {filteredAnnonces.length} annonce{filteredAnnonces.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {/* Filtres par catégorie */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContentContainer}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton, 
                    selectedCategory === category.id && styles.activeCategoryButton,
                    { backgroundColor: darkMode ? '#363636' : '#F0F0F0' }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  {category.icon && (
                    <View style={[
                      styles.categoryIconContainer,
                      { backgroundColor: selectedCategory === category.id 
                        ? (darkMode ? '#ffffff' : '#39335E')
                        : (darkMode ? '#5D5FEF' : '#E6E6FA') 
                      }
                    ]}>
                      <Ionicons 
                        name={category.icon} 
                        size={20} 
                        color={selectedCategory === category.id 
                          ? (darkMode ? '#363636' : '#ffffff')
                          : (darkMode ? '#FFFFFF' : '#5D5FEF')
                        } 
                      />
                    </View>
                  )}
                  <Text 
                    style={[
                      styles.categoryText, 
                      selectedCategory === category.id && styles.activeCategoryText,
                      {color: selectedCategory === category.id 
                        ? '#FFFFFF' 
                        : (darkMode ? '#FFFFFF' : '#39335E')
                      }
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Barre de recherche */}
            <View style={[styles.searchContainer, {backgroundColor: theme.cardbg2 || (darkMode ? '#2A2A2A' : '#F0F0F0')}]}>
              <Ionicons name="search" size={22} color={darkMode ? '#888888' : '#666666'} />
              <TextInput
                style={[styles.searchInput, {color: theme.color}]}
                placeholder="Rechercher une annonce..."
                placeholderTextColor={darkMode ? '#888888' : '#A8A8A8'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={22} color={darkMode ? '#888888' : '#666666'} />
                </TouchableOpacity>
              ) : null}
            </View>
            
            {/* Liste des annonces */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#39335E" />
              </View>
               ) : filteredAnnonces.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}>
                <Ionicons name="alert-circle" size={48} color="#FF9800" />
                <Text style={[styles.emptyText, {color: theme.color}]}>
                  Aucune annonce trouvée
                </Text>
                <Text style={[styles.emptySubtext, {color: theme.secondaryText}]}>
                  Essayez de modifier vos filtres ou publiez une annonce
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredAnnonces}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.announcesListContainer}
                refreshControl={
                  <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh}
                    colors={['#39335E', '#EB001B']}
                    tintColor={darkMode ? '#FFFFFF' : '#39335E'}
                  />
                }
              />
            )}
          </View>
        );
          
      case 'users':
        return (
          <View style={styles.tabContent}>
            {/* Section validation utilisateurs */}
            <View style={styles.usersSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.heading_text, {color: darkMode ? '#FFFFFF' : theme.secondaryText}]}>Validation utilisateurs</Text>
                <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>{pendingUsers} utilisateur(s) en attente</Text>
              </View>
              
              {pendingUsersList.length > 0 ? (
                pendingUsersList.map(user => (
                  <View 
                    key={user.id} 
                    style={[styles.userCard, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}
                  >
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, {color: theme.color}]}>{user.name}</Text>
                      <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>{user.email}</Text>
                      <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>Demande le {user.date}</Text>
                    </View>
                    
                    <View style={styles.userActions}>
                      <TouchableOpacity 
                        style={[styles.approveUserButton, {backgroundColor: '#4CAF50'}]}
                        onPress={() => approveUser(user.id)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        <Text style={styles.approveUserButtonText}>Approuver</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.rejectUserButton, {backgroundColor: '#F44336'}]}
                        onPress={() => rejectUser(user.id)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                        <Text style={styles.rejectUserButtonText}>Rejeter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyContainer, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}>
                  <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                  <Text style={[styles.emptyText, {color: theme.color}]}>
                    Aucun utilisateur en attente
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
          
      case 'settings':
        return (
          <View style={styles.tabContent}>
            
            {/* Section maintenance */}
            <View style={styles.maintenanceSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: theme.color}]}>Maintenance système</Text>
              </View>
              
              <View style={[styles.maintenanceCard, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}>
                <View style={styles.maintenanceIconContainer}>
                  <Ionicons name="refresh-circle" size={48} color="#FF9800" />
                </View>
                <Text style={[styles.maintenanceTitle, {color: theme.color}]}>Réinitialisation annuelle</Text>
                <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>
                  Cette action supprimera toutes les annonces et réinitialisera les statistiques pour la nouvelle année scolaire.
                  Cette opération est irréversible et ne devrait être effectuée qu'une fois par an.
                </Text>
                <TouchableOpacity
                  style={[styles.resetButton, {backgroundColor: '#FF9800',marginTop: 20}]}
                  onPress={resetSystem}
                >
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.resetButtonText}>Réinitialiser le système</Text>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.maintenanceCard, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}>
                <View style={styles.maintenanceIconContainer}>
                  <Ionicons name="cloud-download" size={48} color="#2196F3" />
                </View>
                <Text style={[styles.maintenanceTitle, {color: theme.color}]}>Sauvegarde des données</Text>
                <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>
                  Téléchargez une sauvegarde complète des données utilisateurs et des annonces avant
                  la réinitialisation du système.
                </Text>
                <TouchableOpacity
                  style={[styles.backupButton, {backgroundColor: '#2196F3', marginTop: 20}]}
                  onPress={generatePDF}
                >
                  <Ionicons name="download" size={18} color="#FFFFFF" />
                  <Text style={styles.backupButtonText}>Télécharger la sauvegarde</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.logoutSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: theme.color}]}>Session utilisateur</Text>
              </View>
              
              <View style={[styles.maintenanceCard, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}>
                <View style={styles.maintenanceIconContainer}>
                  <Ionicons name="log-out" size={48} color="#E53935" />
                </View>
                <Text style={[styles.maintenanceTitle, {color: theme.color}]}>Déconnexion</Text>
                <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>
                  Déconnectez-vous de votre compte et retournez à la page de connexion. 
                  Toutes vos données resteront sauvegardées.
                </Text>
                <TouchableOpacity
                  style={[styles.logoutButton, {backgroundColor: '#E53935', marginTop: 20}]}
                  onPress={handleLogout}
                >
                  <Ionicons name="exit-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.logoutButtonText}>Se déconnecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      
      default:
        // Dashboard par défaut (Modération)
        return (
          <View style={styles.tabContent}>
            
            {/* Section modération */}
            <View style={styles.moderationSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, {color: theme.color}]}>Modération</Text>
                <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText, fontSize: 12}]}>
                  {annoncesToModerate.length} annonce(s) à modérer
                </Text>
              </View>
              
              {annoncesToModerate.length > 0 ? (
                annoncesToModerate.map(item => (
                  <View 
                    key={item._id} 
                    style={[styles.moderationCard, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}
                  >
                    <View style={styles.moderationHeader}>
                      <View style={styles.moderationTitleContainer}>
                        <Text style={[styles.moderationTitle, {color: theme.color}]}>{item.title}</Text>
                      </View>
                      <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>
                        Publié le {formatDate(item.date)}
                      </Text>
                      <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>
                        <Text style={{fontWeight: '600'}}>Motif du signalement:</Text> {item.reason || "Nouvelle annonce"}
                      </Text>
                    </View>
                    
                    <View style={styles.moderationDetails}>
                      <View style={styles.moderationDetail}>
                        <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>Catégorie:</Text>
                        <Text style={[styles.moderationDetailValue, {color: theme.color}]}>{item.category}</Text>
                      </View>
                      <View style={styles.moderationDetail}>
                        <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>Type:</Text>
                        <Text style={[styles.moderationDetailValue, {color: theme.color}]}>{item.type || "Non spécifié"}</Text>
                      </View>
                      {item.campType && (
                        <View style={styles.moderationDetail}>
                          <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>Camp:</Text>
                          <Text style={[styles.moderationDetailValue, {color: theme.color}]}>{item.campType}</Text>
                        </View>
                      )}
                      {item.size && (
                        <View style={styles.moderationDetail}>
                          <Text style={[styles.heading_text, {color: darkMode ? '#888888' : theme.secondaryText}]}>Taille:</Text>
                          <Text style={[styles.moderationDetailValue, {color: theme.color}]}>{item.size}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.moderationActions}>
                      <TouchableOpacity 
                        style={[styles.viewButton, {backgroundColor: '#2196F3'}]}
                        onPress={() => router.push(`/annonce/${item._id}`)}  
                      >
                        <Ionicons name="eye" size={16} color="#FFFFFF" />
                        <Text style={styles.viewButtonText}>Voir</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.approveButton, {backgroundColor: '#4CAF50'}]}
                        onPress={() => approveAnnounce(item._id)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        <Text style={styles.approveButtonText}>Approuver</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                      style={[styles.rejectButton, {backgroundColor: '#F44336'}]}
                        onPress={() => rejectAnnounce(item._id)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                        <Text style={styles.rejectButtonText}>Rejeter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyContainer, { backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF', shadowColor: theme.shadow }]}>
                  <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                  <Text style={[styles.emptyText, {color: theme.color}]}>
                    Aucune annonce à modérer
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
    }
  };

  // Composant principal de l'interface
  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}> 
      <StatusBar translucent backgroundColor="transparent" barStyle={darkMode ? "light-content" : 'dark-content'} />

      {/* En-tête avec profil */}
      <View style={styles.header}>
        <View style={styles.header_left}>
          <Image source={profileImage} style={styles.profile} />
          <View style={styles.content}>
            <Text style={[styles.heading_text, {color: darkMode ? '#FFFFFF' : theme.secondaryText,  fontSize: 18}]}>Tableau de bord Admin</Text>
            <Text style={[styles.heading, {color: theme.color}]}>{adminName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notification_box} onPress={() => setActiveTab('dashboard')}>
          {darkMode ? <Dark_Notification style={styles.notification} /> : <Notification style={styles.notification} />}
          {annoncesToModerate.length > 0 && (
            <View style={styles.circle}>
              <Text style={styles.notification_count}>{annoncesToModerate.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View> 

      {/* Navigation entre les onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'dashboard' && styles.activeTab,
            { backgroundColor: activeTab === 'dashboard' ? (darkMode ? '#2A2A2A' : '#FFFFFF') : 'transparent' }
          ]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={activeTab === 'dashboard' ? '#5D5FEF' : (darkMode ? '#888888' : '#666666')}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'dashboard' && styles.activeTabText,
              { color: activeTab === 'dashboard' ? '#5D5FEF' : (darkMode ? '#AAAAAA' : '#666666') }
            ]}
          >
            Modération
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'annonces' && styles.activeTab,
            { backgroundColor: activeTab === 'annonces' ? (darkMode ? '#2A2A2A' : '#FFFFFF') : 'transparent' }
          ]}
          onPress={() => setActiveTab('annonces')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'annonces' ? '#5D5FEF' : (darkMode ? '#888888' : '#666666')}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'annonces' && styles.activeTabText,
              { color: activeTab === 'annonces' ? '#5D5FEF' : (darkMode ? '#AAAAAA' : '#666666') }
            ]}
          >
            Annonces
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'users' && styles.activeTab,
            { backgroundColor: activeTab === 'users' ? (darkMode ? '#2A2A2A' : '#FFFFFF') : 'transparent' }
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons
            name="people"
            size={19}
            color={activeTab === 'users' ? '#5D5FEF' : (darkMode ? '#888888' : '#666666')}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'users' && styles.activeTabText,
              { color: activeTab === 'users' ? '#5D5FEF' : (darkMode ? '#AAAAAA' : '#666666') }
            ]}
          >
            Utilisateurs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'settings' && styles.activeTab,
            { backgroundColor: activeTab === 'settings' ? (darkMode ? '#2A2A2A' : '#FFFFFF') : 'transparent' }
          ]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings"
            size={19}
            color={activeTab === 'settings' ? '#5D5FEF' : (darkMode ? '#888888' : '#666666')}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText,
              { color: activeTab === 'settings' ? '#5D5FEF' : (darkMode ? '#AAAAAA' : '#666666') }
            ]}
          >
            Paramètres
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal qui change selon l'onglet sélectionné */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#39335E', '#EB001B']}
            tintColor={darkMode ? '#FFFFFF' : '#39335E'}
          />
        }
      >
        <View style={styles.adminHeader}>
          <Text style={[styles.adminTitle, { color: theme.color, textAlign: 'center' }]}>
            Bourse au prêt - Administration
          </Text>
        </View>
        {/* Contenu de l'onglet actif */}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    marginBottom: 20,
  },
  header_left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#5D5FEF',
  },
  content: {
    justifyContent: 'center',
  },
  heading_text: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  notification_box: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
  },
  notification: {
    width: 24,
    height: 24,
  },
  circle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notification_count: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adminHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  adminTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  adminSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Montserrat_500Medium',
  },
  // Styles pour les onglets
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderRadius: 12,
    padding: 5,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 10,
    marginLeft: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  activeTabText: {
    fontFamily: 'Montserrat_700Bold',
  },
  tabContent: {
    flex: 1,
  },
  // Styles pour le tableau de bord
  statsContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  statsCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 8,
    fontFamily: 'Montserrat_700Bold',
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Styles pour la section de modération
  moderationSection: {
    marginBottom: 32,
  },
  moderationCount: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  moderationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moderationHeader: {
    marginBottom: 12,
  },
  moderationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moderationTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  moderationDate: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  moderationReason: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  moderationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  moderationDetail: {
    width: '50%',
    marginBottom: 8,
  },
  moderationDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  moderationDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  moderationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_500Medium',
  },
  // Styles pour la section users
  usersSection: {
    marginBottom: 32,
  },
  usersCount: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  userDate: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Montserrat_500Medium',
  },
  userActions: {
    flexDirection: 'row',
  },
  approveUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  approveUserButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  rejectUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  rejectUserButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Styles pour la section security
  securitySection: {
    marginBottom: 32,
  },
  securityCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Montserrat_500Medium',
  },
  // Styles pour la section maintenance
  maintenanceSection: {
    marginBottom: 32,
  },
  maintenanceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  maintenanceIconContainer: {
    marginBottom: 12,
  },
  maintenanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  maintenanceDescription: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    width: '80%',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    width: '80%',
  },
  backupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Styles pour les annonces
  announceCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  categoryBadge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardType: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  // Styles pour annonces list
  announcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  announcesCount: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContentContainer: {
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#5D5FEF',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  activeCategoryText: {
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  announcesListContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutSection: {
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodFilterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignSelf: 'center',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  activePeriodButton: {
    backgroundColor: '#5D5FEF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Montserrat_500Medium',
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
});