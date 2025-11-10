import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING } = theme;

// This is a placeholder for the ItemDetailScreen (Section 6.1)
const ItemDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>Item Detail Screen</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
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
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
  },
});

export default ItemDetailScreen;