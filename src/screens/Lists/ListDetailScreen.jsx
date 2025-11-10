import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING } = theme;

// This is a placeholder for the ListDetailScreen (Section 6.1)
const ListDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>List Detail Screen</Text>
      <Text style={styles.subtitle}>
        (e.g., "Shopping" or "To Do's")
      </Text>
      <Button
        title="Go to Add Item (Modal)"
        onPress={() => navigation.navigate('AddItem')}
      />
      <Button
        title="Go to Item Detail (Push)"
        onPress={() => navigation.navigate('ItemDetail')}
      />
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
    padding: SPACING.lg,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});

export default ListDetailScreen;