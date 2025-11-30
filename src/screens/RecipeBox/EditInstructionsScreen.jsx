import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as theme from '../../utils/theme';

const { COLORS, SPACING, FONT_SIZES, RADII } = theme;

const EditInstructionsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // Get existing data passed from EditRecipeScreen
  const { currentInstructions } = route.params;

  // Join array into a string for the text input
  const [text, setText] = useState(
    currentInstructions ? currentInstructions.join('\n') : ''
  );

  const handleSave = () => {
    // Split by newline, trim whitespace, and remove empty lines
    const instructionsArray = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');

    // Navigate back, passing the new data to the previous screen
    navigation.navigate({
      name: 'EditRecipe',
      params: { savedInstructions: instructionsArray },
      merge: true,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instructions</Text>
        <TouchableOpacity onPress={handleSave} style={styles.iconButton}>
          <Check size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Full Screen Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TextInput
          style={styles.input}
          multiline
          placeholder="Type steps here...&#10;Press Enter for a new bullet point.&#10;e.g.&#10;Cut vegetables&#10;Boil water&#10;Serve hot"
          placeholderTextColor={COLORS.text_light}
          value={text}
          onChangeText={setText}
          autoFocus
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  input: {
    flex: 1,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    textAlignVertical: 'top', // Android fix for multiline
  },
});

export default EditInstructionsScreen;