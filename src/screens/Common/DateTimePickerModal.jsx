import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as theme from '../../utils/theme';

const { COLORS, SPACING, RADII, FONT_SIZES } = theme;

/**
 * A modal that wraps the DateTimePicker for cross-platform use.
 * @param {boolean} visible
 * @param {function} onClose
 * @param {function} onSave - returns the selected Date object
 * @param {Date} initialDate - (Optional) date to show when opening
 * @param {string} mode - 'date', 'time', or 'datetime'. Defaults to 'datetime'.
 */
const DateTimePickerModal = ({ visible, onClose, onSave, initialDate, mode = 'datetime' }) => {
  const [date, setDate] = useState(initialDate || new Date());
  // Internal state to track which picker we are showing (date vs time)
  const [currentPickerMode, setCurrentPickerMode] = useState('date');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setDate(initialDate || new Date());
      // If the prop mode is 'time', start with time. Otherwise start with date.
      setCurrentPickerMode(mode === 'time' ? 'time' : 'date');
    }
  }, [visible, initialDate, mode]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);

    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        // Logic based on the requested 'mode' prop
        if (mode === 'date') {
          // Date-only mode: Save and close immediately
          onSave(currentDate);
        } else if (mode === 'time') {
          // Time-only mode: Save and close immediately
          onSave(currentDate);
        } else {
          // 'datetime' mode: Chain the pickers (Original Behavior)
          if (currentPickerMode === 'date') {
            setCurrentPickerMode('time'); // Switch to time picker
          } else {
            onSave(currentDate); // Time set, we are done
          }
        }
      } else if (event.type === 'dismissed') {
        onClose();
      }
    }
  };

  const handleSave = () => {
    onSave(date);
  };

  // iOS Implementation
  if (Platform.OS === 'ios') {
    return (
      <Modal visible={visible} transparent={true} animationType="slide">
        <View style={styles.iosModalContainer}>
          <View style={styles.iosPickerContainer}>
            {/* Pass the currentPickerMode to the native picker */}
            <DateTimePicker
              value={date}
              mode={currentPickerMode}
              is24Hour={false}
              display="spinner"
              onChange={onChange}
            />
            <View style={styles.iosButtonRow}>
              {/* Only show the toggle button if we are in 'datetime' mode */}
              {mode === 'datetime' && (
                <TouchableOpacity
                  style={styles.iosButton}
                  onPress={() => setCurrentPickerMode(currentPickerMode === 'date' ? 'time' : 'date')}>
                  <Text style={styles.iosButtonText}>
                    {currentPickerMode === 'date' ? 'Set Time' : 'Set Date'}
                  </Text>
                </TouchableOpacity>
              )}
              
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

  // Android Implementation
  return (
    <View>
      {visible && (
        <DateTimePicker
          value={date}
          mode={currentPickerMode}
          is24Hour={false}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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