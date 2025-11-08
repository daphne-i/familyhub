import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for JoinFamilyScreen
const JoinFamilyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Join Family Screen</Text>
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

export default JoinFamilyScreen;