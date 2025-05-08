import React from 'react';
import { 
  View, 
  Modal, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '../../../../components/Button/Button';

// Styles
import styles from '../styles';

const ListingModal = ({ visible, listing, theme, loading, onClose, onModerate }) => {
  if (!listing) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderColor 
        }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              Détails de l'annonce
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <Feather name="x" size={24} color={theme.textColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.listingDetailTitle, { color: theme.textColor }]}>
              {listing.title}
            </Text>
            
            <View style={styles.listingDetailMeta}>
              <View style={[
                styles.listingStatusBadge,
                { 
                  backgroundColor: 
                    listing.status === 'pending' ? '#FFA500' : 
                    listing.status === 'approved' ? '#4CAF50' : '#FF6347'
                }
              ]}>
                <Text style={styles.listingStatusBadgeText}>
                  {listing.status === 'pending' ? 'En attente' : 
                   listing.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                </Text>
              </View>
              <Text style={[styles.listingDetailDate, { color: theme.textSecondary }]}>
                {new Date(listing.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.listingDetailSection}>
              <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                Informations du posteur 
                </Text>
              <View style={[styles.listingDetailCard, { backgroundColor: theme.backgroundColor }]}>
                <Text style={[styles.listingDetailUser, { color: theme.textColor }]}>
                  {listing.userName}
                </Text>
                <Text style={[styles.listingDetailEmail, { color: theme.textSecondary }]}>
                  {listing.userEmail}
                </Text>
                <Text style={[styles.listingDetailPhone, { color: theme.textSecondary }]}>
                  {listing.userPhone || 'Pas de téléphone renseigné'}
                </Text>
              </View>
            </View>
            
            <View style={styles.listingDetailSection}>
              <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                Description
              </Text>
              <Text style={[styles.listingDetailDescription, { color: theme.textColor }]}>
                {listing.description}
              </Text>
            </View>
            
            <View style={styles.listingDetailSection}>
              <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                Catégorie et type
              </Text>
              <View style={styles.listingDetailTags}>
                <View style={styles.listingDetailTag}>
                  <Text style={styles.listingDetailTagText}>
                    {listing.category}
                  </Text>
                </View>
                <View style={styles.listingDetailTag}>
                  <Text style={styles.listingDetailTagText}>
                    {listing.type}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.listingDetailSection}>
              <Text style={[styles.listingDetailSectionTitle, { color: theme.textColor }]}>
                Images
              </Text>
              {listing.images && listing.images.length > 0 ? (
                <FlatList 
                  horizontal 
                  data={listing.images}
                  keyExtractor={(item, index) => `image-${index}`}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Image 
                      source={{ uri: item }} 
                      style={styles.listingDetailImage}
                      resizeMode="cover"
                    />
                  )}
                  contentContainerStyle={styles.listingImagesContainer}
                />
              ) : (
                <Text style={[styles.noImagesText, { color: theme.textSecondary }]}>
                  Aucune image disponible
                </Text>
              )}
            </View>
            
            <View style={styles.modalActions}>
              {listing.status === 'pending' ? (
                <>
                  <Button
                    buttonText="Approuver"
                    onPress={() => onModerate(listing.id, 'approve')}
                    disabled={loading}
                    buttonStyle={styles.approveButton}
                    accessibilityLabel="Approuver l'annonce"
                  />
                  <Button
                    buttonText="Rejeter"
                    onPress={() => onModerate(listing.id, 'reject')}
                    disabled={loading}
                    buttonStyle={styles.rejectButton}
                    textStyle={styles.rejectButtonText}
                    accessibilityLabel="Rejeter l'annonce"
                  />
                </>
              ) : (
                <Button
                  buttonText="Réinitialiser l'état"
                  onPress={() => onModerate(listing.id, 'reset')}
                  disabled={loading}
                  buttonStyle={styles.resetButton}
                  accessibilityLabel="Réinitialiser l'état de l'annonce"
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ListingModal;