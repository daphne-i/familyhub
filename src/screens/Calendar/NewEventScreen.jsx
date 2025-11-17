import React, { useState, useMemo, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { X, ChevronDown, Trash2 } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import firestore from '@react-native-firebase/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import {
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  useFamilyDocument,
} from '../../services/firestore';
import DateTimePickerModal from '../Common/DateTimePickerModal';
import MemberPickerModal from '../Lists/MemberPickerModal';
import EventColorPicker from './EventColorPicker'; // 1. IMPORT Color Picker

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// ... (ModalHeader and FormRow components are unchanged) ...
const ModalHeader = ({ onClose, onSave, loading, isEditMode, onDelete }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onClose}
        disabled={loading}>
        <X size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        {isEditMode ? 'Edit event' : 'New event'}
      </Text>

      {isEditMode ? (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onDelete}
          disabled={loading}>
          <Trash2 size={FONT_SIZES.lg} color={COLORS.text_danger} />
        </TouchableOpacity>
      ) : (
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
      )}
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

const NewEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params || {};
  const isEditMode = !!eventId;

  const { familyId, membersList } = useFamily();
  const { user } = useAuth();

  const {
    data: existingEvent,
    loading: loadingEvent,
  } = useFamilyDocument(isEditMode ? `calendar/${eventId}` : null);

  // --- Form State ---
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLORS.orange); // 2. ADD color state
  const [startAt, setStartAt] = useState(new Date());
  // ... (rest of state is unchanged) ...
  const [endAt, setEndAt] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [isAllDay, setIsAllDay] = useState(false);
  const [repeat, setRepeat] = useState('One time only');
  const [where, setWhere] = useState('');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState([]);

  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Modal State ---
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState('startAt');
  const [isMemberPickerVisible, setMemberPickerVisible] = useState(false);

  // --- Effect to load data in Edit Mode ---
  useEffect(() => {
    if (isEditMode && existingEvent) {
      setTitle(existingEvent.title || '');
      setColor(existingEvent.color || COLORS.orange); // 3. LOAD color
      setStartAt(existingEvent.startAt ? existingEvent.startAt.toDate() : new Date());
      setEndAt(existingEvent.endAt ? existingEvent.endAt.toDate() : new Date());
      // ... (rest of useEffect is unchanged) ...
      setIsAllDay(existingEvent.allDay || false);
      setRepeat(existingEvent.repeat || 'One time only');
      setWhere(existingEvent.location || '');
      setDescription(existingEvent.description || '');
      setAttendees(existingEvent.attendees || []);
      if (existingEvent.location || existingEvent.description) {
        setShowMore(true);
      }
    }
  }, [isEditMode, existingEvent]);

  // ... (attendeeNames memo is unchanged) ...
  const attendeeNames = useMemo(() => {
    if (attendees.length === 0) return 'All';
    if (attendees.length === membersList.length) return 'All';
    if (attendees.length === 1) {
      const member = membersList.find((m) => m.id === attendees[0]);
      return member ? member.displayName : '1 person';
    }
    return `${attendees.length} people`;
  }, [attendees, membersList]);

  // --- Handlers ---
  // ... (showPicker, handleDateSave, handleMemberSave, handleRepeatSave are unchanged) ...
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

  const handleMemberSave = (selectedMember) => {
    setAttendees([selectedMember.id]);
    setMemberPickerVisible(false);
  };

  const handleRepeatSave = (selectedRepeat) => {
    setRepeat(selectedRepeat);
  };


  const handleSave = async () => {
    if (!title) {
      Alert.alert('Missing Title', 'Please enter a title for the event.');
      return;
    }
    setLoading(true);
    
    const finalAttendees = (attendees.length === 0) 
      ? membersList.map(m => m.id) 
      : attendees;

    const eventData = {
      title,
      color: color, // 4. ADD color to save object
      startAt: firestore.Timestamp.fromDate(startAt),
      endAt: firestore.Timestamp.fromDate(endAt),
      allDay: isAllDay,
      repeat,
      location: where,
      description,
      createdBy: existingEvent?.createdBy || user.uid,
      updatedBy: user.uid,
      attendees: finalAttendees,
    };

    try {
      if (isEditMode) {
        await updateCalendarEvent(familyId, eventId, eventData);
      } else {
        await addCalendarEvent(familyId, eventData);
      }
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save event:', e);
      Alert.alert('Error', 'Could not save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ... (handleDelete and loadingEvent checks are unchanged) ...
  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteCalendarEvent(familyId, eventId);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete event.');
              setLoading(false);
            }
          },
        },
      ],
    );
  };
  
  if (loadingEvent) {
     return (
      <View style={styles.container}>
        <ModalHeader onClose={() => navigation.goBack()} loading={true} />
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
     );
  }

  return (
    <View style={styles.container}>
      <ModalHeader 
        onClose={() => navigation.goBack()}
        onSave={handleSave}
        onDelete={handleDelete}
        loading={loading}
        isEditMode={isEditMode}
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

        {/* 5. ADD Color Picker */}
        <EventColorPicker
          selectedColor={color}
          onSelectColor={setColor}
        />

        {/* Date/Time Pickers */}
        <FormRow 
// ... (rest of the form is unchanged) ...
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
        <View style={styles.switchRow}>
          <Text style={styles.formValue}>All day</Text>
          <Switch
            trackColor={{ false: COLORS.text_light, true: COLORS.primary_light }}
            thumbColor={isAllDay ? COLORS.primary : COLORS.white}
            onValueChange={() => setIsAllDay((prev) => !prev)}
            value={isAllDay}
          />
        </View>
        <FormRow 
          label="Attendees:" 
          value={attendeeNames}
          onPress={() => setMemberPickerVisible(true)}
        />
        {showMore ? (
          <View>
            <FormRow 
              label="Repeat:" 
              value={repeat} 
              onPress={() =>
                navigation.navigate('Repeat', {
                  currentValue: repeat,
                  onSave: handleRepeatSave,
                })
              }
            />
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
      
      {isEditMode && (
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ... (Modals are unchanged) ... */}
      <DateTimePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onSave={handleDateSave}
        currentValue={pickerMode === 'startAt' ? startAt : endAt}
      />
      <MemberPickerModal
        visible={isMemberPickerVisible}
        onClose={() => setMemberPickerVisible(false)}
        onSelect={handleMemberSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
// ... (all styles are unchanged) ...
  container: {
    flex: 1,
    backgroundColor: COLORS.background_light,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
    width: 60,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  saveText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    height: 50,
    color: COLORS.text_dark,
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
    flexShrink: 1,
  },
  formValue: {
    color: COLORS.text_dark,
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
    textAlign: 'right',
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
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
    marginVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreButtonText: {
    color: COLORS.text_dark,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  saveButtonContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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