import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, SPACING, RADII } = theme;

// Define the palette of colors users can choose from
const EVENT_COLORS = [
  COLORS.primary, // Blue
  COLORS.green,
  COLORS.orange,
  COLORS.purple,
  COLORS.text_danger, // Red
  '#FFC107', // Amber
  '#00BCD4', // Cyan
  '#E91E63', // Pink
];

const EventColorPicker = ({ selectedColor, onSelectColor }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}>
      {EVENT_COLORS.map((color) => {
        const isSelected = selectedColor === color;
        return (
          <TouchableOpacity
            key={color}
            style={[
              styles.swatch,
              { backgroundColor: color },
              isSelected && styles.selectedSwatch,
            ]}
            onPress={() => onSelectColor(color)}>
            {isSelected && <Check size={24} color={COLORS.white} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSwatch: {
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default EventColorPicker;