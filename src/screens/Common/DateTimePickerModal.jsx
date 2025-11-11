import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as theme from '../../utils/theme';

const { COLORS, SPACING, RADII, FONT_SIZES } = theme;

/**
 * A modal that wraps the DateTimePicker for cross-platform use.
 * It shows a "Date" picker first, then a "Time" picker.
 */
const DateTimePickerModal = ({ visible, onClose, onSave }) => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date'); // 'date' or 'time'

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);

    // On Android, the picker closes automatically.
    // We'll use this to chain the pickers.
    if (event.type === 'set' && mode === 'date') {
      // Date was set, now show time
      setMode('time');
    } else if (event.type === 'set' && mode === 'time') {
      // Time was set, save and close
      onSave(currentDate);
    } else if (event.type === 'dismissed') {
      // User cancelled
      onClose();
    }
  };

  const handleSave = () => {
    onSave(date);
  };

  // On iOS, we need to show the picker inside a modal
  if (Platform.OS === 'ios') {
    return (
      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.iosModalContainer}>
          <View style={styles.iosPickerContainer}>
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={false}
              display="spinner"
              onChange={onChange}
            />
            <View style={styles.iosButtonRow}>
              <TouchableOpacity
                style={styles.iosButton}
                onPress={() => setMode(mode === 'date' ? 'time' : 'date')}>
                <Text style={styles.iosButtonText}>
                  {mode === 'date' ? 'Set Time' : 'Set Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iosButton, styles.iosButtonPrimary]}
                onPress={handleSave}>
                <Text style={[styles.iosButtonText, styles.iosButtonTextPrimary]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.iosButton} onPress={onClose}>
              <Text style={styles.iosButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // On Android, the picker is shown natively
  return (
    <View>
      {visible && (
        <DateTimePicker
          value={date}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // --- iOS Styles ---
  iosModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosPickerContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopLeftRadius: RADII.lg,
    borderTopRightRadius: RADII.lg,
  },
  iosButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  iosButton: {
    padding: SPACING.md,
    borderRadius: RADII.md,
    backgroundColor: COLORS.border,
    flex: 1,
    alignItems: 'center',
    margin: SPACING.xs,
  },
  iosButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  iosButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    fontWeight: '600',
  },
  iosButtonTextPrimary: {
    color: COLORS.white,
  },
});

export default DateTimePickerModal;