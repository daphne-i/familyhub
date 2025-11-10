import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, ChevronDown } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const ModalHeader = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <X size={FONT_SIZES.xl} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>New event</Text>
    </View>
  );
};

const FormRow = ({ label, value, onPress }) => (
  <View style={styles.formRow}>
    <Text style={styles.formLabel}>{label}</Text>
    <TouchableOpacity style={styles.formValueContainer} onPress={onPress}>
      <Text style={styles.formValue}>{value}</Text>
      <ChevronDown size={20} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

// --- Main Screen ---

const NewEventScreen = () => {
  const [isAllDay, setIsAllDay] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ModalHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Title"
            placeholderTextColor={COLORS.text_light}
            style={styles.textInput}
          />
        </View>

        {/* Date/Time Pickers */}
        <FormRow label="From:" value="08/11/2025, 0..." />
        <FormRow label="To:" value="08/11/2025, 0..." />

        {/* All Day Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.formValue}>All day</Text>
          <Switch
            trackColor={{ false: COLORS.text_light, true: COLORS.primary_light }}
            thumbColor={isAllDay ? COLORS.primary : COLORS.white}
            onValueChange={() => setIsAllDay((prev) => !prev)}
            value={isAllDay}
          />
        </View>

        {/* Attendees */}
        <View style={styles.attendeesRow}>
          <Text style={styles.formValue}>Attendees: All</Text>
          {/* Add mock avatars */}
        </View>

        {/* More Options */}
        {showMore ? (
          <View>
            <FormRow label="Repeat:" value="Never" />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Where?"
                placeholderTextColor={COLORS.text_light}
                style={styles.textInput}
              />
            </View>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                placeholder="Description"
                placeholderTextColor={COLORS.text_light}
                style={[styles.textInput, styles.textArea]}
                multiline
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowMore(true)}>
            <Text style={styles.moreButtonText}>More options</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100, // Room for save button
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background_dark_secondary,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: SPACING.lg,
  },
  // --- Form ---
  inputContainer: {
    backgroundColor: COLORS.background_dark_secondary,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  textInput: {
    height: 50,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
  },
  textAreaContainer: {
    height: 120,
  },
  textArea: {
    height: '100%',
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  formLabel: {
    color: COLORS.text_light,
    fontSize: FONT_SIZES.md,
  },
  formValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formValue: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  attendeesRow: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  moreButton: {
    backgroundColor: COLORS.background_dark_secondary,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  moreButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background_dark,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default NewEventScreen;