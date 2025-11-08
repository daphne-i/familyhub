import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/theme';

// This is the loading screen shown when the app is checking auth state
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Loading Family Hub...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background_white,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default SplashScreen;