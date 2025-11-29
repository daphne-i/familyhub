import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { FileText, Image as ImageIcon, Camera, X } from 'lucide-react-native';
// 1. Import keepLocalCopy
import * as DocumentPicker from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const AddFileModal = ({ visible, onClose, onUpload, storagePrefix }) => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper to clean up URIs for Firebase
  const getUploadPath = (uri) => {
    if (!uri) return null;
    let path = uri;

    // 1. If it's a file:// URI, decode it and strip prefix for Android
    if (path.startsWith('file://')) {
      path = decodeURIComponent(path);
      if (Platform.OS === 'android') {
        path = path.substring(7);
      }
    }
    // 2. If it's a content:// URI, leave it as is (Firebase supports it IF permissions are valid)
    // BUT we prefer local paths to avoid permission errors.
    return path;
  };

  const handleDocumentPick = async () => {
    try {
      // 1. Pick the file
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        mode: 'import', 
        allowMultiSelection: false,
      });
      
      const file = result[0];
      if (!file) return;

      // 2. EXPLICITLY COPY to local cache (Fixes "Permission Denial")
      // @react-native-documents/picker v11+ requires this separate call
      const copyResult = await DocumentPicker.keepLocalCopy({
        files: [
          { uri: file.uri, fileName: file.name || 'temp_doc' }
        ],
        destination: 'cachesDirectory',
      });

      const localFile = copyResult[0];

      if (localFile.status === 'success') {
        // 3. Upload the LOCAL copy
        processUpload(
          file.name || 'document', 
          file.size, 
          file.type || 'application/octet-stream', 
          localFile.localUri // Use the new local path!
        );
      } else {
        Alert.alert("Error", "Could not copy file locally.");
      }

    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Unknown error picking file');
      }
    }
  };

  const handleImagePick = async () => {
    const result = await launchImageLibrary({ 
      mediaType: 'photo', 
      selectionLimit: 1,
      includeBase64: false, 
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      processUpload(asset.fileName || `photo_${Date.now()}.jpg`, asset.fileSize, asset.type, asset.uri);
    }
  };

  const handleCamera = async () => {
    const result = await launchCamera({ 
      mediaType: 'photo', 
      saveToPhotos: true 
    });
    
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      processUpload(asset.fileName || `camera_${Date.now()}.jpg`, asset.fileSize, asset.type, asset.uri);
    }
  };

  const processUpload = async (fileName, fileSize, fileType, rawUri) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadUri = getUploadPath(rawUri);
      if (!uploadUri) throw new Error("Invalid file path");

      console.log("Uploading from:", uploadUri); 

      const uniqueName = `${Date.now()}_${fileName}`;
      // Basic sanitization
      const cleanName = uniqueName.replace(/[^a-zA-Z0-9._-]/g, '_');
      
      const reference = storage().ref(`${storagePrefix}/${cleanName}`);

      const task = reference.putFile(uploadUri);

      task.on('state_changed', taskSnapshot => {
        setUploadProgress(
          (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100
        );
      });

      await task;

      const url = await reference.getDownloadURL();
      
      await onUpload({
        fileName,
        fileSize,
        fileType,
        storagePath: reference.fullPath,
        downloadUrl: url,
      });
      
      onClose();
    } catch (error) {
      console.error("Upload error details:", error);
      let msg = "Could not upload file.";
      if (error.message.includes('Permission Denial')) msg = "Permission denied. Please try again.";
      Alert.alert("Upload Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add a File</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Uploading... {uploadProgress.toFixed(0)}%
              </Text>
            </View>
          ) : (
            <View style={styles.options}>
              <TouchableOpacity style={styles.optionButton} onPress={handleDocumentPick}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary_light }]}>
                  <FileText size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleImagePick}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.purple_light }]}>
                  <ImageIcon size={24} color={COLORS.purple} />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleCamera}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.orange_light }]}>
                  <Camera size={24} color={COLORS.orange} />
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl + 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
  },
});

export default AddFileModal;