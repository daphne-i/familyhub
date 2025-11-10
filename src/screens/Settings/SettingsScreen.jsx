import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING } = theme;

// This is a placeholder screen, but it's a VALID component
// This will fix your "invalid component" crash
const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Manage account, invite members, and sign out.
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={signOut} color={COLORS.red} />
      </View>

      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white_dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text_light,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    marginVertical: SPACING.xl,
    width: '100%',
  },
});

export default SettingsScreen;