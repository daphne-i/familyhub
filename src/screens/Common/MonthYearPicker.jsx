import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, SPACING, RADII, FONT_SIZES } = theme;

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const MonthYearPicker = ({ visible, onClose, onSave, initialDate }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (visible && initialDate) {
      setSelectedYear(initialDate.getFullYear());
    }
  }, [visible, initialDate]);

  const handleMonthPress = (monthIndex) => {
    // Create a new date object for the 1st of the selected month/year
    const newDate = new Date(selectedYear, monthIndex, 1);
    onSave(newDate);
    onClose();
  };

  const renderMonthItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.monthItem}
      onPress={() => handleMonthPress(index)}>
      <Text style={styles.monthText}>{item.substring(0, 3)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Month</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>

          {/* Year Selector */}
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.arrowButton}>
              <ChevronLeft size={28} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.arrowButton}>
              <ChevronRight size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Month Grid */}
          <FlatList
            data={MONTHS}
            renderItem={renderMonthItem}
            keyExtractor={(item) => item}
            numColumns={4}
            contentContainerStyle={styles.monthGrid}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  yearText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  arrowButton: {
    padding: SPACING.xs,
  },
  monthGrid: {
    paddingBottom: SPACING.sm,
  },
  monthItem: {
    flex: 1,
    aspectRatio: 1.5, // Rectangular shape
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs,
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.md,
  },
  monthText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text_dark,
  },
});

export default MonthYearPicker;