import { StyleSheet, Text, View, TouchableOpacity, FlatList, Animated, RefreshControl, Alert, Platform } from 'react-native';
import React, { useContext, useState, useRef, useEffect } from 'react';
import Back from "../../assets/images/back.svg";
import Dark_back from "../../assets/images/dark_back.svg";
import { Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { SourceSansPro_400Regular } from '@expo-google-fonts/source-sans-pro';
import ThemeContext from '../../theme/ThemeContext';
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications } from '../../services/notificationService'; // Importer la fonction que vous avez définie
import * as Notifications from 'expo-notifications';


// Créez un composant Toast simple (sans dépendance externe)
const SimpleToast = ({ visible, title, body, onPress, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.toast, 
        { 
          opacity: fadeAnim,
          transform: [{ 
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            })
          }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.toastIconContainer}>
          <Ionicons name="notifications" size={24} color="#fff" />
        </View>
        <View style={styles.toastTextContainer}>
          <Text style={styles.toastTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.toastBody} numberOfLines={2}>{body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Notification = () => {
    const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'unread', 'read'
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const filterButtonOpacity = useRef(new Animated.Value(1)).current;
    
    // État pour le toast
    const [toast, setToast] = useState({
      visible: false,
      title: '',
      body: '',
      data: null,
    });
    
    // Animation pour les notifications
    const animatedValues = useRef([]).current;
    
    // Charger les notifications au démarrage
    useEffect(() => {
    loadNotifications();
    
    // Configure notification listeners
    const foregroundSubscription = setupForegroundNotificationListener();
    
    // For handling notifications when user taps on them
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        // Navigate based on notification data
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
    });
    
    return () => {
        // Clean up listeners
        if (foregroundSubscription) {
            foregroundSubscription.remove();
        }
        if (backgroundSubscription) {
            backgroundSubscription.remove();
        }
    };
}, []);
    
    // Configurer l'écouteur de notifications au premier plan
    const setupForegroundNotificationListener = () => {
    return Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification reçue au premier plan:', notification);
        
        // Sauvegarder la notification
        saveNotification(notification);
        
        // Afficher un toast pour la nouvelle notification
        setToast({
          visible: true,
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
        
        // Actualiser la liste des notifications
        loadNotifications();
        
        // Fournir un retour haptique pour la nouvelle notification
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    });
};

// Add this helper function in your component if not already present
const saveNotification = async (notification) => {
  try {
    const storedNotifications = await AsyncStorage.getItem('notifications');
    const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    notifications.unshift({
      id: notification.request.identifier || Date.now().toString(),
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
      timestamp: Date.now(),
      read: false,
    });
    
    if (notifications.length > 50) notifications.splice(50);
    
    await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};
    
    // Charger les notifications depuis AsyncStorage
    const loadNotifications = async () => {
        try {
            setRefreshing(true);
            
            // Récupérer les notifications depuis AsyncStorage
            const savedNotifications = await getNotifications();
            
            // Transformer les notifications pour les adapter à notre format d'affichage
            const formattedNotifications = savedNotifications.map(notification => ({
                id: notification.id,
                name: notification.title,
                message: notification.body,
                date: moment(notification.timestamp).format('DD MMM YYYY'),
                time: moment(notification.timestamp).format('HH:mm'),
                isNew: !notification.read,
                category: determineCategory(notification),
                data: notification.data,
                icon: getCategoryIcon(determineCategory(notification), theme.color)
            }));
            
            setNotifications(formattedNotifications);
            
            // Initialiser les animations pour les nouvelles notifications
            animatedValues.length = formattedNotifications.length;
            for (let i = 0; i < formattedNotifications.length; i++) {
                if (!animatedValues[i]) {
                    animatedValues[i] = new Animated.Value(0);
                }
            }
            
            // Animer les notifications
            Animated.stagger(50, 
                animatedValues.map(anim => 
                    Animated.spring(anim, {
                        toValue: 1,
                        friction: 6,
                        tension: 40,
                        useNativeDriver: true
                    })
                )
            ).start();
            
            setRefreshing(false);
        } catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
            setRefreshing(false);
        }
    };
    
    // Déterminer la catégorie de la notification
    const determineCategory = (notification) => {
        if (!notification.data) return 'system';
        
        if (notification.data.conversationId) {
            return 'message';
        } else if (notification.data.postId) {
            return 'annonce';
        } else if (notification.data.type === 'payment') {
            return 'payment';
        } else if (notification.data.type === 'alert') {
            return 'alert';
        }
        
        return 'system';
    };
    
    // Obtenir l'icône en fonction de la catégorie
    const getCategoryIcon = (category, color) => {
        switch(category) {
            case 'message':
                return <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />;
            case 'annonce':
                return <MaterialCommunityIcons name="bullhorn-outline" size={24} color={color} />;
            case 'payment':
                return <MaterialCommunityIcons name="cash-multiple" size={24} color={color} />;
            case 'alert':
                return <Ionicons name="warning-outline" size={24} color={color} />;
            default:
                return <Ionicons name="notifications-outline" size={24} color={color} />;
        }
    };
    
    // Rafraîchir les notifications
    const onRefresh = async () => {
        await loadNotifications();
    };

    // Marquer une notification comme lue
    const markAsRead = async (id) => {
        try {
            // Mettre à jour l'état local
            const updatedNotifications = notifications.map(item => 
                item.id === id ? { ...item, isNew: false } : item
            );
            setNotifications(updatedNotifications);
            
            // Mettre à jour dans AsyncStorage
            const storedNotifications = await AsyncStorage.getItem('notifications');
            const notificationsArray = storedNotifications ? JSON.parse(storedNotifications) : [];
            
            const updatedStoredNotifications = notificationsArray.map(item => 
                item.id === id ? { ...item, read: true } : item
            );
            
            await AsyncStorage.setItem('notifications', JSON.stringify(updatedStoredNotifications));
            
            // Fournir un retour haptique
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        } catch (error) {
            console.error('Erreur lors du marquage de la notification comme lue:', error);
        }
    };
    
    // Supprimer une notification
    const deleteNotification = async (id) => {
        Alert.alert(
            "Supprimer la notification",
            "Êtes-vous sûr de vouloir supprimer cette notification ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Supprimer", 
                    onPress: async () => {
                        try {
                            // Mettre à jour l'état local
                            const updatedNotifications = notifications.filter(item => item.id !== id);
                            setNotifications(updatedNotifications);
                            
                            // Mettre à jour dans AsyncStorage
                            const storedNotifications = await AsyncStorage.getItem('notifications');
                            const notificationsArray = storedNotifications ? JSON.parse(storedNotifications) : [];
                            
                            const updatedStoredNotifications = notificationsArray.filter(item => item.id !== id);
                            
                            await AsyncStorage.setItem('notifications', JSON.stringify(updatedStoredNotifications));
                            
                            // Fournir un retour haptique
                            if (Platform.OS !== 'web') {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            }
                        } catch (error) {
                            console.error('Erreur lors de la suppression de la notification:', error);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Supprimer toutes les notifications
    const clearAllNotifications = () => {
        Alert.alert(
            "Effacer toutes les notifications",
            "Êtes-vous sûr de vouloir effacer toutes les notifications ?",
            [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Effacer", 
                    onPress: async () => {
                        try {
                            // Vider l'état local
                            setNotifications([]);
                            
                            // Vider dans AsyncStorage
                            await AsyncStorage.setItem('notifications', JSON.stringify([]));
                            
                            // Fournir un retour haptique
                            if (Platform.OS !== 'web') {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            }
                        } catch (error) {
                            console.error('Erreur lors de la suppression de toutes les notifications:', error);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Basculer les options de filtrage
    const toggleFilterOptions = () => {
        setShowFilterOptions(!showFilterOptions);
        
        Animated.timing(filterButtonOpacity, {
            toValue: showFilterOptions ? 1 : 0.7,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    // Navigation en fonction du type de notification
    const handleNotificationNavigation = (notificationData) => {
        if (!notificationData) return;
        
        // Naviguer vers la conversation ou l'annonce concernée
        if (notificationData.postId) {
            router.push(`/annonce/${notificationData.postId}`);
        } else if (notificationData.conversationId) {
            router.push(`(screens)/chat_screen?id=${notificationData.conversationId}`);
        }
    };
    
    // Voir les détails d'une notification
    const viewNotificationDetails = async (notification) => {
        // Marquer comme lue
        await markAsRead(notification.id);
        
        // Naviguer en fonction du type de notification
        if (notification.data) {
            handleNotificationNavigation(notification.data);
        } else {
            // Afficher les détails si aucune navigation n'est possible
            Alert.alert(
                notification.name,
                notification.message || "Pas de détails supplémentaires.",
                [{ text: "Fermer", style: "cancel" }]
            );
        }
    };
    
    // Obtenir les notifications filtrées
    const getFilteredNotifications = () => {
        switch(filterMode) {
            case 'unread':
                return notifications.filter(item => item.isNew);
            case 'read':
                return notifications.filter(item => !item.isNew);
            default:
                return notifications;
        }
    };

    // Obtenir la couleur de la catégorie
    const getCategoryColor = (category) => {
        switch(category) {
            case 'payment':
                return '#4CAF50';
            case 'alert':
                return '#FF5722';
            case 'message':
                return '#2196F3';
            case 'annonce':
                return '#FFC107';
            default:
                return '#9C27B0';
        }
    };

    const renderNotificationItem = ({ item, index }) => {
        const translateY = animatedValues[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0]
        }) || 0;
        
        const opacity = animatedValues[index] || 1;
        
        return (
            <Animated.View 
                style={[
                    { transform: [{ translateY }], opacity }
                ]}
            >
                <View style={styles.notificationItemContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.stack, 
                            {
                                backgroundColor: theme.cardbg2,
                                borderLeftWidth: 3,
                                borderLeftColor: getCategoryColor(item.category)
                            }
                        ]} 
                        onPress={() => viewNotificationDetails(item)}
                        activeOpacity={0.7}
                        delayLongPress={600}
                        onLongPress={() => deleteNotification(item.id)}
                    >
                        <View style={styles.stack_left}>
                            <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                                {item.icon}
                            </View>
                            <View style={styles.content}>
                                <Text style={[styles.name, {color: theme.color}]}>{item.name}</Text>
                                {item.message && (
                                    <Text 
                                        style={[styles.message, {color: theme.color3}]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {item.message}
                                    </Text>
                                )}
                                <Text style={[styles.date, {color: theme.color3}]}>
                                    {item.date} | {item.time}
                                </Text>
                            </View>
                        </View>
                        {item.isNew && (
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => markAsRead(item.id)}
                            >
                                <Text style={styles.new}>nouveau</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                    
                    {/* Actions rapides sous chaque notification */}
                    <View style={styles.quickActions}>
                        {item.isNew && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.readButton]}
                                onPress={() => markAsRead(item.id)}
                            >
                                <MaterialCommunityIcons name="email-open-outline" size={16} color="#fff" />
                                <Text style={styles.actionText}>Marquer comme lu</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => deleteNotification(item.id)}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#fff" />
                            <Text style={styles.actionText}>Supprimer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, {backgroundColor: theme.background}]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={darkMode ? ['#1a1a2e', '#16213e'] : ['#f9f9ff', '#e9eeff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => router.push('home')}
                            style={styles.backButton}
                        >
                            {darkMode ? <Dark_back /> : <Back />}
                        </TouchableOpacity>
                        
                        <Text style={[styles.heading, {color: theme.color}]}>Notifications</Text>
                        
                        <View style={styles.headerActions}>
                            <Animated.View style={{ opacity: filterButtonOpacity }}>
                                <TouchableOpacity 
                                    style={[
                                        styles.filterButton, 
                                        { backgroundColor: theme.cardbg2 }
                                    ]}
                                    onPress={toggleFilterOptions}
                                >
                                    <Ionicons 
                                        name="filter" 
                                        size={18} 
                                        color={theme.color} 
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.clearButton, 
                                    { 
                                        backgroundColor: theme.cardbg2,
                                        opacity: notifications.length > 0 ? 1 : 0.5 
                                    }
                                ]}
                                onPress={clearAllNotifications}
                                disabled={notifications.length === 0}
                            >
                                <MaterialCommunityIcons 
                                    name="notification-clear-all" 
                                    size={18} 
                                    color={theme.color} 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
                
                {/* Filter options */}
                {showFilterOptions && (
                    <BlurView
                        intensity={darkMode ? 20 : 50}
                        tint={darkMode ? "dark" : "light"}
                        style={styles.filterOptions}
                    >
                        <TouchableOpacity 
                            style={[
                                styles.filterOption, 
                                filterMode === 'all' && styles.activeFilterOption
                            ]}
                            onPress={() => {
                                setFilterMode('all');
                                setShowFilterOptions(false);
                            }}
                        >
                            <Text 
                                style={[
                                    styles.filterOptionText, 
                                    { color: filterMode === 'all' ? '#fff' : theme.color }
                                ]}
                            >
                                Toutes
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterOption, 
                                filterMode === 'unread' && styles.activeFilterOption
                            ]}
                            onPress={() => {
                                setFilterMode('unread');
                                setShowFilterOptions(false);
                            }}
                        >
                            <Text 
                                style={[
                                    styles.filterOptionText, 
                                    { color: filterMode === 'unread' ? '#fff' : theme.color }
                                ]}
                            >
                                Non lues
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                styles.filterOption, 
                                filterMode === 'read' && styles.activeFilterOption
                            ]}
                            onPress={() => {
                                setFilterMode('read');
                                setShowFilterOptions(false);
                            }}
                        >
                            <Text 
                                style={[
                                    styles.filterOptionText, 
                                    { color: filterMode === 'read' ? '#fff' : theme.color }
                                ]}
                            >
                                Lues
                            </Text>
                        </TouchableOpacity>
                    </BlurView>
                )}
            </View>
            
            {/* Notification Count */}
            <View style={styles.statusBar}>
                <Text style={[styles.statusText, { color: theme.color3 }]}>
                    {getFilteredNotifications().length} notification{getFilteredNotifications().length !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.statusFilter, { color: theme.color3 }]}>
                    {filterMode === 'all' ? 'Toutes' : filterMode === 'unread' ? 'Non lues' : 'Lues'}
                </Text>
            </View>

            {/* Notifications List */}
            {getFilteredNotifications().length > 0 ? (
                <FlatList
                    data={getFilteredNotifications()}
                    renderItem={renderNotificationItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[getCategoryColor('system')]}
                            tintColor={getCategoryColor('system')}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons 
                        name="bell-off-outline" 
                        size={80} 
                        color={theme.color3 + '50'} 
                    />
                    <Text style={[styles.emptyText, { color: theme.color3 }]}>
                        Aucune notification {filterMode !== 'all' ? `(${filterMode === 'unread' ? 'non lue' : 'lue'})` : ''}
                    </Text>
                    <TouchableOpacity 
                        style={[styles.refreshButton, { backgroundColor: theme.cardbg2 }]}
                        onPress={onRefresh}
                    >
                        <Text style={[styles.refreshButtonText, { color: theme.color }]}>
                            Rafraîchir
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Toast personnalisé */}
            <SimpleToast
              visible={toast.visible}
              title={toast.title}
              body={toast.body}
              onPress={() => {
                handleNotificationNavigation(toast.data);
                setToast({...toast, visible: false});
              }}
              onHide={() => setToast({...toast, visible: false})}
            />
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
    },
    headerContainer: {
        position: 'relative',
        zIndex: 10,
    },
    headerGradient: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    heading: {
        fontSize: 22,
        lineHeight: 26,
        fontFamily: 'Montserrat_700Bold',
        color: '#39335E',
        textTransform: 'capitalize',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    clearButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    filterOptions: {
        position: 'absolute',
        top: 105,
        right: 20,
        borderRadius: 10,
        overflow: 'hidden',
        padding: 5,
        zIndex: 100,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    filterOption: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 2,
    },
    activeFilterOption: {
        backgroundColor: '#242424',
    },
    filterOptionText: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 12,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    statusText: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 14,
    },
    statusFilter: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        gap: 12,
    },
    notificationItemContainer: {
        marginVertical: 6,
    },
    stack: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stack_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    content: {
        gap: 3,
        flex: 1,
    },
    name: {
        fontSize: 14,
        lineHeight: 18,
        fontFamily: 'Montserrat_700Bold',
        textTransform: 'capitalize',
    },
    message: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'SourceSansPro_400Regular',
    },
    date: {
        fontSize: 11,
        lineHeight: 14,
        fontFamily: 'Montserrat_500Medium',
        marginTop: 4,
    },
    button: {
        backgroundColor: '#242424',
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    new: {
        fontSize: 10,
        lineHeight: 15,
        fontFamily: 'SourceSansPro_400Regular',
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 6,
        paddingRight: 5,
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 10,
        gap: 4,
    },
    readButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    actionText: {
        color: '#FFF',
        fontFamily: 'SourceSansPro_400Regular',
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    emptyText: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    refreshButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    refreshButtonText: {
        fontFamily: 'Montserrat_700Bold',
        fontSize: 14,
    },
});