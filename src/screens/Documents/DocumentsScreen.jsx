import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Folder, Plus, X } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection, addFolder } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;
const { width } = Dimensions.get('window');
const cardSize = (width - SPACING.lg * 3) / 2;

// --- Components ---

const DocumentsHeader = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Documents</Text>
      <View style={styles.headerButton} /> 
    </View>
  );
};

const FolderCard = ({ folder, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Folder size={40} color={COLORS.orange} fill={COLORS.orange_light} />
    </View>
    <Text style={styles.cardTitle} numberOfLines={1}>{folder.name}</Text>
    <Text style={styles.cardSubtitle}>
      {folder.fileCount || 0} {folder.fileCount === 1 ? 'file' : 'files'}
    </Text>
  </TouchableOpacity>
);

const CreateFolderModal = ({ visible, onClose, onSave, loading }) => {
  const [folderName, setFolderName] = useState('');

  const handleSave = () => {
    if (folderName.trim()) {
      onSave(folderName);
      setFolderName('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Folder Name (e.g., Insurance)"
            placeholderTextColor={COLORS.text_light}
            value={folderName}
            onChangeText={setFolderName}
            autoFocus
          />

          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Folder</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Main Screen ---

const DocumentsScreen = () => {
  const navigation = useNavigation();
  const { familyId } = useFamily();
  const { data: folders, loading, error } = useFamilyCollection('docFolders');
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateFolder = async (name) => {
    setCreating(true);
    try {
      await addFolder(familyId, name);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to create folder.');
    } finally {
      setCreating(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    return (
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Folder size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No folders yet.</Text>
            <Text style={styles.emptySubtext}>Tap + to create one.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <FolderCard 
            folder={item} 
            onPress={() => navigation.navigate('FolderDetail', { 
              folderId: item.id, 
              folderName: item.name 
            })} 
          />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <DocumentsHeader />
      {renderContent()}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>

      <CreateFolderModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateFolder}
        loading={creating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
    width: 40,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  listContent: {
    padding: SPACING.lg,
  },
  card: {
    width: cardSize,
    height: cardSize * 0.8,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    margin: SPACING.sm / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.xl,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADII.md,
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
});

export default DocumentsScreen;