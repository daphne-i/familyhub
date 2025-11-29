import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, File, Image as ImageIcon, Trash2, Plus } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFolderDocuments, addDocument, deleteDocument } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import AddFileModal from './AddFileModal';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const FolderHeader = ({ title }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerButton} />
    </View>
  );
};

// Updated FileItem: Wrapped in TouchableOpacity and added onPress
const FileItem = ({ file, onPress, onDelete }) => {
  const isImage = file.fileType && file.fileType.startsWith('image');
  
  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <TouchableOpacity style={styles.fileRow} onPress={onPress}>
      <View style={[styles.iconBox, isImage ? styles.iconBoxPurple : styles.iconBoxBlue]}>
        {isImage ? (
          <ImageIcon size={24} color={COLORS.purple} />
        ) : (
          <File size={24} color={COLORS.primary} />
        )}
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
        <Text style={styles.fileMeta}>{formatSize(file.fileSize)}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton} onPress={onDelete}>
        <Trash2 size={20} color={COLORS.text_light} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const FolderDetailScreen = () => {
  const navigation = useNavigation(); // Added navigation
  const route = useRoute();
  const { folderId, folderName } = route.params;
  const { familyId } = useFamily();
  const { user } = useAuth();
  
  const { data: files, loading } = useFolderDocuments(folderId);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const handleUpload = async (fileData) => {
    try {
      await addDocument(familyId, folderId, {
        ...fileData,
        uploadedBy: user.uid,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save file metadata.");
    }
  };

  const handleDelete = (file) => {
    Alert.alert(
      "Delete File",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocument(familyId, folderId, file.id);
            } catch (e) {
              Alert.alert("Error", "Failed to delete file.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FolderHeader title={folderName} />
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <View style={styles.emptyIconBg}>
                 <File size={40} color={COLORS.text_light} />
              </View>
              <Text style={styles.emptyText}>It's a bit empty here</Text>
              <Text style={styles.emptySubtext}>Press the + button below to add something awesome.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <FileItem 
              file={item} 
              onPress={() => navigation.navigate('FileViewer', { file: item })} // Navigate on press
              onDelete={() => handleDelete(item)} 
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
      
      <AddFileModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onUpload={handleUpload}
        storagePrefix={`families/${familyId}/${folderId}`}
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
    flexGrow: 1,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background_light,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconBoxBlue: {
    backgroundColor: COLORS.primary_light,
  },
  iconBoxPurple: {
    backgroundColor: COLORS.purple_light,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
  },
  moreButton: {
    padding: SPACING.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    textAlign: 'center',
    maxWidth: '70%',
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
});

export default FolderDetailScreen;