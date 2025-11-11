import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, ChevronDown } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import firestore from '@react-native-firebase/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import { addCalendarEvent } from '../../services/firestore';
import DateTimePickerModal from '../Common/DateTimePickerModal'; 

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const ModalHeader = ({ onClose, onSave, loading }) => {
  const insets = useSafeAreaInsets();
  return (
    // Updated for Light Mode
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onClose}
        disabled={loading}>
        <X size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>New event</Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.saveText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const FormRow = ({ label, value, onPress }) => (
  <View style={styles.formRow}>
    <Text style={styles.formLabel}>{label}</Text>
    <TouchableOpacity style={styles.formValueContainer} onPress={onPress}>
      <Text style={styles.formValue}>{value}</Text>
      {onPress && <ChevronDown size={20} color={COLORS.text_dark} />}
    </TouchableOpacity>
  </View>
);

// --- Main Screen ---

const NewEventScreen = () => {
  const navigation = useNavigation();
  const { familyId } = useFamily();
  const { user } = useAuth();

  // --- Form State ---
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeat, setRepeat] = useState('Never');
  const [where, setWhere] = useState('');
  const [description, setDescription] = useState('');
  
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Date Picker State ---
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState('startAt');

  const showPicker = (mode) => {
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const handleDateSave = (selectedDate) => {
    setPickerVisible(false);
    if (!selectedDate) return; 

    if (pickerMode === 'startAt') {
      setStartAt(selectedDate);
      if (endAt < selectedDate) {
        setEndAt(new Date(selectedDate.getTime() + 60 * 60 * 1000));
      }
    } else {
      setEndAt(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Missing Title', 'Please enter a title for the event.');
      return;
    }
    setLoading(true);

    const newEvent = {
      title,
      startAt: firestore.Timestamp.fromDate(startAt),
      endAt: firestore.Timestamp.fromDate(endAt),
      allDay: isAllDay,
      repeat,
      location: where,
      description,
      createdBy: user.uid,
      attendees: [user.uid],
    };

    try {
      await addCalendarEvent(familyId, newEvent);
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save event:', e);
      Alert.alert('Error', 'Could not save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ModalHeader 
        onClose={() => navigation.goBack()}
        onSave={handleSave}
        loading={loading}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Title"
            placeholderTextColor={COLORS.text_light}
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date/Time Pickers */}
        <FormRow 
          label="From:" 
          value={startAt.toLocaleString([], {
            year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
          onPress={() => showPicker('startAt')}
        />
        <FormRow 
          label="To:" 
          value={endAt.toLocaleString([], {
            year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
          onPress={() => showPicker('endAt')}
        />

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
        </View>

        {/* More Options */}
        {showMore ? (
          <View>
            <FormRow label="Repeat:" value={repeat} onPress={() => {/* TODO: Add repeat picker */}} />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Where?"
                placeholderTextColor={COLORS.text_light}
                style={styles.textInput}
                value={where}
                onChangeText={setWhere}
              />
            </View>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                placeholder="Description"
                placeholderTextColor={COLORS.text_light}
                style={[styles.textInput, styles.textArea]}
                multiline
                value={description}
                onChangeText={setDescription}
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
      
      {/* Date Picker Modal */}
      <DateTimePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onSave={handleDateSave}
        currentValue={pickerMode === 'startAt' ? startAt : endAt}
      />
    </View>
  );
};

// --- UPDATED STYLES FOR LIGHT MODE ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_light, // Changed
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, // Changed
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark, // Changed
  },
  saveText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // --- Form ---
  inputContainer: {
    backgroundColor: COLORS.white, // Changed
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    height: 50,
    color: COLORS.text_dark, // Changed
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
    color: COLORS.text_light, // Changed
    fontSize: FONT_SIZES.md,
  },
  formValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formValue: {
    color: COLORS.text_dark, // Changed
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
    backgroundColor: COLORS.white, // Changed
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
    marginVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreButtonText: {
    color: COLORS.text_dark, // Changed
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default NewEventScreen;