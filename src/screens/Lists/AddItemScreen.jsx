import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  X,
  Check,
  Square,
  User,
  Calendar,
  Repeat,
  Type,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { addListItem } from '../../services/firestore';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../hooks/useFamily';
import {
  SHOPPING_CATEGORIES,
  TODO_DEFAULT_CATEGORIES,
} from '../../constants';

// Local Components
import CategoryPickerModal from './CategoryPickerModal';
import MemberPickerModal from './MemberPickerModal';

// Common Components
import DateTimePickerModal from '../Common/DateTimePickerModal';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// ... (ModalHeader component is unchanged) ...
const ModalHeader = ({ onSave, loading }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
        disabled={loading}>
        <X size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Add an item</Text>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Check size={FONT_SIZES.xl} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
};

// ... (FormRow component is unchanged) ...
const FormRow = ({ icon, label, onPress, value }) => (
  <TouchableOpacity style={styles.formRow} onPress={onPress}>
    <View style={styles.formRowLeft}>
      {icon}
      <Text style={styles.formLabel}>{label}</Text>
    </View>
    {value && <Text style={styles.formValue}>{value}</Text>}
  </TouchableOpacity>
);

// ... (formatDate, formatTime helpers are unchanged) ...
const formatDate = (date) => {
  if (!date) return null;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (date) => {
  if (!date) return null;
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

// --- Main Screen ---

const AddItemScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { familyId } = useFamily();
  const { listId, listType } = route.params;

  // ... (state variables are unchanged) ...
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [isMemberPickerVisible, setMemberPickerVisible] = useState(false);
  const [isNoteInputVisible, setNoteInputVisible] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [repeat, setRepeat] = useState('One time only');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  
  // ... (defaultCategory logic is unchanged) ...
  const defaultCategory = useMemo(() => {
    const categories =
      listType === 'shopping'
        ? SHOPPING_CATEGORIES
        : TODO_DEFAULT_CATEGORIES;
    return categories.find((c) => c.id === 'uncategorized');
  }, [listType]);

  const selectedCategory = category || defaultCategory;

  // --- NEW FUNCTION (Rule 1) ---
  const handleRepeatSave = (newRepeatValue) => {
    setRepeat(newRepeatValue);
    // If user picks a repeat option AND no date is set, default to tomorrow
    if (newRepeatValue !== 'One time only' && dueDate === null) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // 12:00 AM
      setDueDate(tomorrow);
    }
  };

  // ... (handleSave logic is unchanged) ...
  const handleSave = async () => {
    if (!name) {
      setError('Item name is required.');
      return;
    }
    setLoading(true);
    setError(null);

    const newItem = {
      name: name,
      familyId: familyId,
      note: note,
      category: selectedCategory.id,
      assigneeId: assignee ? assignee.id : null,
      completed: false,
      createdBy: user.uid,
      // --- FIX 1: Convert JS Date to Firestore Timestamp ---
      dueDate: dueDate ? firestore.Timestamp.fromDate(dueDate) : null,
      repeat: repeat,
    };

    try {
      // --- FIX 2: Use the correct function name ---
      await addListItem(familyId, listId, newItem);
      navigation.goBack();
    } catch (e) {      setError(e.message);
      setLoading(false);
    }
  };  const formattedDate = dueDate ? formatDate(dueDate) : null;
  const formattedTime = dueDate ? formatTime(dueDate) : null;

  return (
    <View style={styles.container}>
      <ModalHeader onSave={handleSave} loading={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* ... (Title Input is unchanged) ... */}
          <View style={[styles.formRow, styles.inputRow]}>
            <Square size={20} color={COLORS.text_light} />
            <TextInput
              style={styles.textInput}
              placeholder="Title"
              placeholderTextColor={COLORS.text_light}
              value={name}
              onChangeText={setName}
              autoFocus={true}
            />
          </View>

          {/* ... (Category Picker is unchanged) ... */}
          <FormRow
            icon={<Text style={styles.iconText}>{selectedCategory.icon}</Text>}
            label={selectedCategory.name}
            value={null}
            onPress={() => setCategoryPickerVisible(true)}
          />

          {/* ... (Assignee Row is unchanged) ... */}
          <FormRow
            icon={<User size={20} color={COLORS.text_light} />}
            label="Assigned to"
            value={assignee ? assignee.displayName : null}
            onPress={() => setMemberPickerVisible(true)}
          />

          {/* ... (Date Row is unchanged) ... */}
          <FormRow
            icon={<Calendar size={20} color={COLORS.text_light} />}
            label="Set date & reminder"
            value={formattedDate ? `${formattedDate} | ${formattedTime}` : null}
            onPress={() => setDatePickerVisible(true)}
          />
          
          {/* --- UPDATED REPEAT ROW --- */}
          <FormRow
            icon={<Repeat size={20} color={COLORS.text_light} />}
            label="Repeat"
            value={repeat !== 'One time only' ? repeat : null}
            onPress={() =>
              navigation.navigate('Repeat', {
                currentValue: repeat,
                onSave: handleRepeatSave, // Use the new handler
              })
            }
          />

          {/* ... (Note Input is unchanged) ... */}
          {isNoteInputVisible ? (
            <View style={[styles.formRow, styles.inputRow]}>
              <Type size={20} color={COLORS.text_light} />
              <TextInput
                style={styles.textInput}
                placeholder="Add note"
                placeholderTextColor={COLORS.text_light}
                value={note}
                onChangeText={setNote}
                autoFocus={true}
              />
            </View>
          ) : (
            <FormRow
              icon={<Type size={20} color={COLORS.text_light} />}
              label="Add note"
              onPress={() => setNoteInputVisible(true)}
            />
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      {/* ... (Modals are unchanged) ... */}
      <CategoryPickerModal
        visible={isCategoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        onSelect={setCategory}
        listType={listType}
      />
      
      <MemberPickerModal
        visible={isMemberPickerVisible}
        onClose={() => setMemberPickerVisible(false)}
        onSelect={setAssignee}
      />
      
      <DateTimePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSave={(date) => {
          setDatePickerVisible(false);
          setDueDate(date);
        }}
      />
    </View>
  );
};

// ... (Styles are unchanged) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_modal,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  // --- Form ---
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    overflow: 'hidden',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  formRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    marginLeft: SPACING.md,
  },
  formValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
  },
  iconText: {
    fontSize: FONT_SIZES.md,
  },
  inputRow: {
    paddingVertical: SPACING.sm, // Smaller padding for inputs
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    marginLeft: SPACING.md,
    paddingVertical: SPACING.sm, // Ensure height
  },
  errorText: {
    color: COLORS.text_danger,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default AddItemScreen;