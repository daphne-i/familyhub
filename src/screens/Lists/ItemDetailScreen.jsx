import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Trash,
  Square,
  CheckSquare,
  User,
  Calendar,
  Bell,
  Repeat,
  ShoppingCart,
  Image as ImageIcon,
  Type,
  Heart,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import {
  useFamilyDocument,
  updateListItem,
  deleteListItem,
} from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext'; // 1. IMPORT useAuth
import {
  SHOPPING_CATEGORIES,
  TODO_DEFAULT_CATEGORIES,
} from '../../constants';
import firestore from '@react-native-firebase/firestore'; // IMPORT FIRESTORE

// Local Components
import MemberPickerModal from './MemberPickerModal';

// Common Components
import DateTimePickerModal from '../Common/DateTimePickerModal';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// ... (DetailHeader, FormRow, format helpers are unchanged) ...
const DetailHeader = ({ onDelete }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>List item</Text>
      <TouchableOpacity style={styles.headerButton} onPress={onDelete}>
        <Trash size={FONT_SIZES.lg} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const FormRow = ({ icon, label, onPress, value, valueColor }) => (
  <TouchableOpacity style={styles.formRow} onPress={onPress}>
    <View style={styles.formRowLeft}>
      {icon}
      <Text style={styles.formLabel}>{label}</Text>
    </View>
    {value && (
      <Text style={[styles.formValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    )}
  </TouchableOpacity>
);

const formatDate = (date) => {
  if (!date) return null;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
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
// ...

const ItemDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  // ... (hooks and route params are unchanged) ...
  
  // 2. FIX THE DESTRUCTURING
  const { familyId, membersList } = useFamily(); // Remove 'user'
  const { user } = useAuth(); // Get 'user' from useAuth()

  const { itemId, listId, listType, listName } = route.params;

  const {
    data: item,
    loading,
    error,
  } = useFamilyDocument(`lists/${listId}/items/${itemId}`);

  // ... (local state is unchanged) ...
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isMemberPickerVisible, setMemberPickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // ... (useEffect and memos are unchanged) ...
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setNote(item.note || '');
    }
  }, [item]);

  const category = useMemo(() => {
    if (!item || !item.category) return null;
    const categories =
      listType === 'shopping'
        ? SHOPPING_CATEGORIES
        : TODO_DEFAULT_CATEGORIES;
    return categories.find((c) => c.id === item.category);
  }, [item, listType]);

  const assignee = useMemo(() => {
    if (!item || !item.assigneeId || !membersList) return null;
    return membersList.find((m) => m.id === item.assigneeId);
  }, [item, membersList]);
  
  const dueDate = useMemo(() => {
    return item?.dueDate ? item.dueDate.toDate() : null;
  }, [item]);
  const formattedDate = dueDate ? formatDate(dueDate) : null;
  const formattedTime = dueDate ? formatTime(dueDate) : null;
  
  const lastUpdatedUser = useMemo(() => {
     if (!item?.updatedBy || !membersList) return user?.displayName || '...';
     return membersList.find((m) => m.id === item.updatedBy)?.displayName || user?.displayName || '...';
  }, [item, membersList, user]);

  // ... (handleToggleComplete, handleFieldUpdate, handleDelete, handleAssigneeSelect are unchanged) ...
  const handleToggleComplete = async () => {
    if (!item) return;
    try {
      await updateListItem(familyId, listId, itemId, {
        completed: !item.completed,
        updatedBy: user.uid, // Track who updated
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!item || item[field] === value) return; // No change
    try {
      await updateListItem(familyId, listId, itemId, {
        [field]: value,
        updatedBy: user.uid, // Track who updated
      });
    } catch (e) {
      Alert.alert('Error', `Failed to update ${field}.`);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              navigation.goBack(); // Navigate away first
              await deleteListItem(familyId, listId, itemId);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ],
    );
  };

  const handleAssigneeSelect = async (selectedMember) => {
    if (!item) return;
    const newAssigneeId = selectedMember ? selectedMember.id : null;
    try {
      await updateListItem(familyId, listId, itemId, {
        assigneeId: newAssigneeId,
        updatedBy: user.uid,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to update assignee.');
    }
  };

  // --- THIS IS THE FIX ---
  const handleDateSave = async (selectedDate) => {
    setDatePickerVisible(false);
    if (!selectedDate) return; // Don't do anything if date is invalid

    try {
      await updateListItem(familyId, listId, itemId, {
        // We MUST convert the JS Date object to a Firestore Timestamp
        dueDate: firestore.Timestamp.fromDate(selectedDate),
        updatedBy: user.uid,
      });
    } catch (e) {
      console.error("Date save error:", e); // Log the actual error
      Alert.alert('Error', 'Failed to update date.');
    }
  };
  // --- END FIX ---

  const handleRepeatSave = async (selectedRepeat) => {
    // ... (This function is unchanged) ...
    const updates = { 
      repeat: selectedRepeat,
      updatedBy: user.uid,
    };
    
    if (selectedRepeat !== 'One time only' && !item.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // 12:00 AM
      updates.dueDate = firestore.Timestamp.fromDate(tomorrow);
    }
    
    try {
      await updateListItem(familyId, listId, itemId, updates);
    } catch (e) {
      Alert.alert('Error', 'Failed to update repeat setting.');
    }
  };

  // ... (Render logic is unchanged) ...
  if (loading) {
// ... (rest of the file is identical) ...
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading item.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DetailHeader onDelete={handleDelete} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* ... (Title Input is unchanged) ... */}
          <View style={[styles.formRow, styles.inputRow]}>
            <TouchableOpacity onPress={handleToggleComplete}>
              {item.completed ? (
                <CheckSquare size={24} color={COLORS.primary} />
              ) : (
                <Square size={24} color={COLORS.text_light} />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              onEndEditing={() => handleFieldUpdate('name', name)}
            />
          </View>

          {/* ... (Category is unchanged) ... */}
          <FormRow
            icon={<Text style={styles.iconText}>{category?.icon}</Text>}
            label="Category"
            value={category?.name}
            // TODO: Add onPress to open category picker
          />
          {/* ... (List is unchanged) ... */}
          <FormRow
            icon={<ShoppingCart size={20} color={COLORS.text_light} />}
            label="List"
            value={listName}
          />
          {/* ... (Note Input is unchanged) ... */}
          <View style={[styles.formRow, styles.inputRow]}>
            <Type size={20} color={COLORS.text_light} />
            <TextInput
              style={styles.textInput}
              placeholder="Add note"
              placeholderTextColor={COLORS.text_light}
              value={note}
              onChangeText={setNote}
              onEndEditing={() => handleFieldUpdate('note', note)}
              onFocus={() => setIsNoteFocused(true)}
              onBlur={() => setIsNoteFocused(false)}
            />
          </View>

          {/* ... (Assignee Row is unchanged) ... */}
          <FormRow
            icon={<User size={20} color={COLORS.text_light} />}
            label="Assign to"
            value={assignee ? assignee.displayName : null}
            onPress={() => setMemberPickerVisible(true)}
          />
          
          {/* ... (Date Row is unchanged) ... */}
          <FormRow
            icon={<Calendar size={20} color={COLORS.text_light} />}
            label="Set date"
            value={formattedDate}
            valueColor={formattedDate ? COLORS.text_danger : null}
            onPress={() => setDatePickerVisible(true)}
          />
          {/* ... (Reminder Row is unchanged) ... */}
          <FormRow
            icon={<Bell size={20} color={COLORS.text_light} />}
            label="Add reminder"
            value={formattedTime}
            valueColor={formattedTime ? COLORS.text_danger : null}
            onPress={() => setDatePickerVisible(true)}
          />
          {/* --- UPDATED REPEAT ROW --- */}
          <FormRow
            icon={<Repeat size={20} color={COLORS.text_light} />}
            label="Repeat"
            value={item?.repeat !== 'One time only' ? item.repeat : null}
            onPress={() =>
              navigation.navigate('Repeat', {
                currentValue: item?.repeat || 'One time only',
                onSave: handleRepeatSave, // Use the new handler
              })
            }
          />

          {/* ... (Photo Row is unchanged) ... */}
          <FormRow
            icon={<ImageIcon size={20} color={COLORS.text_light} />}
            label="Add photo"
          />
        </View>

        {/* ... (Favorite Button is unchanged) ... */}
        <View style={styles.footerActions}>
          <TouchableOpacity>
            <Heart size={24} color={COLORS.text_light} />
          </TouchableOpacity>
        </View>

        {/* ... (Footer Text is unchanged) ... */}
        <Text style={styles.footerText}>
          Updated 4 min ago by {lastUpdatedUser}
        </Text>
      </ScrollView>

      {/* ... (Modals are unchanged) ... */}
      <MemberPickerModal
        visible={isMemberPickerVisible}
        onClose={() => setMemberPickerVisible(false)}
        onSelect={handleAssigneeSelect}
      />
      
      <DateTimePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSave={handleDateSave}
      />

      {/* ... (Comment Bar is unchanged) ... */}
      {!isNoteFocused && (
        <View style={styles.commentBar}>
          <TextInput
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.text_light}
            style={styles.commentInput}
          />
        </View>
      )}
    </View>
  );
};

// ... (Styles are unchanged) ...
const styles = StyleSheet.create({
// ... (rest of the file is identical) ...
  container: {
    flex: 1,
    backgroundColor: COLORS.background_modal,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_danger,
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
    paddingVertical: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    marginLeft: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  // --- Footer ---
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
  },
  // --- Comment Bar ---
  commentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
  },
  commentInput: {
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
});

export default ItemDetailScreen;