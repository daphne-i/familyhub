import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { COLORS, SPACING, FONT_SIZES, RADII, FONTS } from '../../utils/theme';
import { Users, UserPlus } from 'lucide-react-native';

// Replaces the placeholder
const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth(); // Get the logged-in user

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Placeholder for a nice illustration */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>FH</Text>
        </View>
        
        {/* Welcome Text */}
        <Text style={styles.title}>
          Welcome, {user?.displayName || 'Friend'}!
        </Text>
        <Text style={styles.subtitle}>
          Let's get your family hub set up.
        </Text>

        {/* Create Family Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CreateFamily')}
        >
          <Users color={COLORS.white} size={22} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Create a new family</Text>
        </TouchableOpacity>

        {/* Join Family Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('JoinFamily')}
        >
          <UserPlus color={COLORS.primary} size={22} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            Join a family
          </Text>
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
    alignItems: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primary_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontFamily: FONTS.bold,
    fontSize: 50,
    color: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text_dark,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    color: COLORS.text_light,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    marginBottom: SPACING.lg,
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonIcon: {
    marginRight: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semibold,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
});

export default WelcomeScreen;