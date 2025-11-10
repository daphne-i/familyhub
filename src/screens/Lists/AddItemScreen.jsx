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
  Tag,
  User,
  Calendar,
  Bell,
  Repeat,
  Image as ImageIcon,
  Type,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { addItemToList } from '../../services/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useFamily } from '../../hooks/useFamily';
import CategoryPickerModal from './CategoryPickerModal'; // Import the modal
import {
  SHOPPING_CATEGORIES,
  TODO_DEFAULT_CATEGORIES,
} from '../../constants';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

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

// Re-usable Form Row Component
const FormRow = ({ icon, label, onPress, value }) => (
  <TouchableOpacity style={styles.formRow} onPress={onPress}>
    <View style={styles.formRowIcon}>{icon}</View>
    <Text
      style={[
        styles.formRowLabel,
        value ? styles.formRowLabelWithValue : styles.formRowLabel,
      ]}>
      {value || label}
    </Text>
  </TouchableOpacity>
);

// --- Main Screen ---

const AddItemScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { familyId } = useFamily();
  const { listId, listType } = route.params;

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState(null); // { id, name, icon }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [isNoteInputVisible, setNoteInputVisible] = useState(false);

  // Get the default category info
  const defaultCategory = useMemo(() => {
    const categories =
      listType === 'shopping'
        ? SHOPPING_CATEGORIES
        : TODO_DEFAULT_CATEGORIES;
    return categories.find((c) => c.id === 'uncategorized');
  }, [listType]);

  const selectedCategory = category || defaultCategory;

  const handleSave = async () => {
    if (!name) {
      setError('Item name is required.');
      return;
    }
    setLoading(true);
    setError(null);

    const newItem = {
      name: name,
      note: note,
      category: selectedCategory.id,
      completed: false,
      createdBy: user.uid,
      // We'll add dueDate, etc. here later
    };

    try {
      await addItemToList(familyId, listId, newItem);
      navigation.goBack(); // Close the modal on success
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ModalHeader onSave={handleSave} loading={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Title Input */}
          <View style={[styles.formRow, styles.inputRow]}>
            <View style={styles.formRowIcon}>
              <Square size={24} color={COLORS.text_light} />
            </View>
            <TextInput
              placeholder="Title"
              placeholderTextColor={COLORS.text_light}
              value={name}
              onChangeText={setName}
              style={styles.textInput}
              autoFocus={true}
            />
          </View>

          {/* Category Picker */}
          <FormRow
            icon={<Text style={styles.iconText}>{selectedCategory.icon}</Text>}
            label="Uncategorized"
            value={selectedCategory.name}
            onPress={() => setCategoryPickerVisible(true)}
          />

          {/* Static Rows */}
          <FormRow
            icon={<User size={20} color={COLORS.text_light} />}
            label="Assigned to"
          />
          <FormRow
            icon={<Calendar size={20} color={COLORS.text_light} />}
            label="Set date & reminder"
          />
          <FormRow
            icon={<Repeat size={20} color={COLORS.text_light} />}
            label="Repeat"
          />
          <FormRow
            icon={<ImageIcon size={20} color={COLORS.text_light} />}
            label="Add photo"
          />

          {/* Note Input */}
          {isNoteInputVisible ? (
            <View style={[styles.formRow, styles.inputRow]}>
              <View style={styles.formRowIcon}>
                <Type size={20} color={COLORS.text_light} />
              </View>
              <TextInput
                placeholder="Add note"
                placeholderTextColor={COLORS.text_light}
                value={note}
                onChangeText={setNote}
                style={styles.textInput}
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

      <CategoryPickerModal
        visible={isCategoryPickerVisible}
        onClose={() => setCategoryPickerVisible(false)}
        onSelect={setCategory}
        listType={listType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_modal,
  },
  scrollContent: {
    padding: SPACING.lg,
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
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputRow: {
    paddingVertical: SPACING.md, // Adjust for input height
  },
  formRowIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  iconText: {
    fontSize: FONT_SIZES.md,
  },
  formRowLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
  },
  formRowLabelWithValue: {
    color: COLORS.text_dark,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    height: 40,
  },
  // --- Error ---
  errorText: {
    color: COLORS.text_danger,
    fontSize: FONT_SIZES.base,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default AddItemScreen;