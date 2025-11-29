import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as theme from '../../utils/theme';

const { COLORS, SPACING, FONT_SIZES } = theme;

const FileViewerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { file } = route.params; // Expecting { fileName, downloadUrl, fileType }

  const isImage = file.fileType && file.fileType.startsWith('image');
  const isPdf = file.fileType === 'application/pdf';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {file.fileName}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <X size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Content Viewer */}
      <View style={styles.content}>
        {isImage ? (
          <Image
            source={{ uri: file.downloadUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : isPdf ? (
          <Pdf
            source={{ uri: file.downloadUrl, cache: true }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onError={(error) => {
              console.log(error);
            }}
            trustAllCerts={false} // Often needed for Android
          />
        ) : (
          <View style={styles.centerMessage}>
            <Text style={styles.errorText}>
              Preview not available for this file type.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background for viewer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  title: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#000',
  },
  centerMessage: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.text_danger,
    fontSize: FONT_SIZES.md,
  },
});

export default FileViewerScreen;