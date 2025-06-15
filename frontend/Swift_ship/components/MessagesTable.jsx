import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemeContext from '../theme/ThemeContext';
import { getConversationMessagesForTable } from '../services/api';

const MessagesTable = ({ conversationId, onClose }) => {
  const { theme, darkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getConversationMessagesForTable(conversationId);
      
      if (response.success) {
        setMessages(response.messages);
      } else {
        throw new Error(response.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      Alert.alert('Erreur', error.message || 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const getStatusIcon = (isRead) => {
    return isRead ? (
      <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
    ) : (
      <Ionicons name="mail-unread" size={16} color="#FF9800" />
    );
  };

  const getStatusText = (isRead) => {
    return isRead ? 'Lu' : 'Non lu';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.color }]}>
            Messages de la conversation
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.color} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#836EFE" />
          <Text style={[styles.loadingText, { color: theme.secondaryColor }]}>
            Chargement des messages...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.color }]}>
          Messages de la conversation ({messages.length})
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.color} />
        </TouchableOpacity>
      </View>

      {/* Tableau des messages */}
      <ScrollView 
        style={styles.tableContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={50} color={theme.secondaryColor} />
            <Text style={[styles.emptyText, { color: theme.secondaryColor }]}>
              Aucun message dans cette conversation
            </Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={[styles.tableHeader, { backgroundColor: theme.cardbg }]}>
              <Text style={[styles.headerCell, styles.contentColumn, { color: theme.color }]}>
                Contenu du message
              </Text>
              <Text style={[styles.headerCell, styles.senderColumn, { color: theme.color }]}>
                Expéditeur
              </Text>
              <Text style={[styles.headerCell, styles.dateColumn, { color: theme.color }]}>
                Date d'envoi
              </Text>
              <Text style={[styles.headerCell, styles.statusColumn, { color: theme.color }]}>
                Statut
              </Text>
            </View>

            {/* Lignes du tableau */}
            {messages.map((message, index) => (
              <View 
                key={message.id} 
                style={[
                  styles.tableRow, 
                  { 
                    backgroundColor: index % 2 === 0 ? theme.background : theme.cardbg,
                    borderBottomColor: theme.borderColor 
                  }
                ]}
              >
                <Text style={[styles.cell, styles.contentColumn, { color: theme.color }]}>
                  {message.content}
                </Text>
                <Text style={[styles.cell, styles.senderColumn, { color: theme.color }]}>
                  {message.senderName}
                </Text>
                <Text style={[styles.cell, styles.dateColumn, { color: theme.secondaryColor }]}>
                  {message.formattedDate}
                </Text>
                <View style={[styles.cell, styles.statusColumn, styles.statusCell]}>
                  {getStatusIcon(message.isRead)}
                  <Text style={[
                    styles.statusText, 
                    { color: message.isRead ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {getStatusText(message.isRead)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer avec informations */}
      <View style={[styles.footer, { backgroundColor: theme.cardbg, borderTopColor: theme.borderColor }]}>
        <Text style={[styles.footerText, { color: theme.secondaryColor }]}>
          Total: {messages.length} messages • 
          Lus: {messages.filter(m => m.isRead).length} • 
          Non lus: {messages.filter(m => !m.isRead).length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  table: {
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  cell: {
    fontSize: 14,
    paddingVertical: 4,
  },
  contentColumn: {
    flex: 3,
    paddingRight: 8,
  },
  senderColumn: {
    flex: 2,
    paddingRight: 8,
    textAlign: 'center',
  },
  dateColumn: {
    flex: 2,
    paddingRight: 8,
    textAlign: 'center',
  },
  statusColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default MessagesTable;