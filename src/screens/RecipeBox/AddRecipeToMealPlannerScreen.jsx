import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES } = theme;

const AddRecipeToMealPlannerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add to Meal Planner (Coming Soon)</Text>
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
    color: COLORS.text_dark,
  },
});

export default AddRecipeToMealPlannerScreen;