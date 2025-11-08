import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { createFamily } from '../../services/family';
import { COLORS, SPACING, FONT_SIZES, RADII, FONTS } from '../../utils/theme';
import { Users } from 'lucide-react-native';

// Replaces the placeholder
const CreateFamilyScreen = () => {
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!familyName) {
      setError('Please enter a family name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createFamily(familyName);
      // Success! RootNavigator will handle the navigation.
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Family</Text>
        <Text style={styles.subtitle}>
          This will be the name of your shared hub.
        </Text>

        <View style={styles.inputContainer}>
          <Users color={COLORS.text_light} size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., The Smith Family"
            placeholderTextColor={COLORS.text_light}
            value={familyName}
            onChangeText={setFamilyName}
            autoCapitalize="words"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Create Family</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text_dark,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text_light,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background_light,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
  },
  errorText: {
    color: COLORS.text_danger,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});

export default CreateFamilyScreen;