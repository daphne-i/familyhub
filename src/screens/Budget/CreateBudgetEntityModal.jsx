import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// A few presets to help them get started
const EMOJI_PRESETS = [
  '🍕', '🎳', '💅', '🎩', '🎮', '🎻', '🎨', '🚴',
  '🧸', '💊', '📚', '💸', '🏠', '🚗', '✈️', '🐶',
  '🐱', '🎓', '💼', '☂️', '🔥', '⭐', '💡', '🔧'
];

const CreateBudgetEntityModal = ({ visible, onClose, onSave, title, entityType }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⭐'); // Default emoji

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), icon, type: entityType });
      setName('');
      setIcon('⭐');
      onClose();
    }
  };

  const renderEmoji = ({ item }) => (
    <TouchableOpacity onPress={() => setIcon(item)} style={styles.emojiItem}>
      <Text style={styles.emojiPreset}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>

          {/* Preview & Input */}
          <View style={styles.inputRow}>
             {/* Emoji Input Area */}
            <View style={styles.iconPreviewContainer}>
               <TextInput
                style={styles.emojiInput}
                value={icon}
                onChangeText={(text) => {
                    // Basic Emoji Filtering: allow only 1-2 chars mostly
                    if (text.length > 2) setIcon(text.substring(text.length - 2));
                    else setIcon(text);
                }}
                maxLength={2} 
                // On Android/iOS, opening emoji keyboard is manual, 
                // so we let them type or paste, or pick from presets.
              />
            </View>

            {/* Name Input */}
            <TextInput
              style={styles.nameInput}
              placeholder="Name (e.g., Bowling)"
              placeholderTextColor={COLORS.text_light}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
          
          <Text style={styles.label}>Or pick an icon:</Text>
          <View style={styles.gridContainer}>
            <FlatList
                data={EMOJI_PRESETS}
                renderItem={renderEmoji}
                keyExtractor={(item) => item}
                numColumns={8}
                scrollEnabled={false}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderTopLeftRadius: RADII.lg,
    borderTopRightRadius: RADII.lg,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl, // Extra padding for bottom safe area
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconPreviewContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiInput: {
    fontSize: 24,
    textAlign: 'center',
    color: COLORS.text_dark,
    padding: 0,
  },
  nameInput: {
    flex: 1,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
    marginBottom: SPACING.sm,
  },
  gridContainer: {
    marginBottom: SPACING.xl,
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  emojiPreset: {
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
});

export default CreateBudgetEntityModal;