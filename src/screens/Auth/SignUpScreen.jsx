import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for SignUpScreen
const SignUpScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign Up Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;