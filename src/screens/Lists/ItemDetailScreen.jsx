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
  Tag,
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
import {
  SHOPPING_CATEGORIES,
  TODO_DEFAULT_CATEGORIES,
} from '../../constants';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

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
        <Trash size={FONT_SIZES.lg} color={COLORS.text_danger} />
      </TouchableOpacity>
    </View>
  );
};

// Re-using AddItemScreen's FormRow
const FormRow = ({ icon, label, onPress, value, valueColor }) => (
  <TouchableOpacity style={styles.formRow} onPress={onPress}>
    <View style={styles.formRowIcon}>{icon}</View>
    <Text
      style={[
        styles.formRowLabel,
        value && styles.formRowLabelWithValue,
        valueColor && { color: valueColor },
      ]}>
      {value || label}
    </Text>
  </TouchableOpacity>
);

// --- Main Screen ---

const ItemDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { familyId } = useFamily();
  const { itemId, listId, listType, listName } = route.params;

  // Fetch the item data in real-time
  const {
    data: item,
    loading,
    error,
  } = useFamilyDocument(`lists/${listId}/items/${itemId}`);

  // Local state for editing fields
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isNoteFocused, setIsNoteFocused] = useState(false);

  // When item data loads from Firestore, update our local state
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setNote(item.note || '');
    }
  }, [item]);

  // Find the category info
  const category = useMemo(() => {
    if (!item) return null;
    const categories =
      listType === 'shopping'
        ? SHOPPING_CATEGORIES
        : TODO_DEFAULT_CATEGORIES;
    return (
      categories.find((c) => c.id === item.category) ||
      categories.find((c) => c.id === 'uncategorized')
    );
  }, [item, listType]);

  // --- Functions ---

  const handleToggleComplete = async () => {
    if (!item) return;
    try {
      await updateListItem(familyId, listId, itemId, {
        completed: !item.completed,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!item) return;
    try {
      await updateListItem(familyId, listId, itemId, {
        [field]: value,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to save update.');
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
              await deleteListItem(familyId, listId, itemId);
              navigation.goBack(); // Go back after successful delete
            } catch (e) {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  // --- Render ---

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load item.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DetailHeader onDelete={handleDelete} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Title Input */}
          <View style={[styles.formRow, styles.inputRow]}>
            <TouchableOpacity
              style={styles.formRowIcon}
              onPress={handleToggleComplete}>
              {item.completed ? (
                <CheckSquare size={24} color={COLORS.primary} />
              ) : (
                <Square size={24} color={COLORS.text_light} />
              )}
            </TouchableOpacity>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[
                styles.textInput,
                item.completed && styles.textInputCompleted,
              ]}
              onBlur={() => handleFieldUpdate('name', name)} // Save on blur
            />
          </View>

          {/* Category */}
          <FormRow
            icon={<Text style={styles.iconText}>{category?.icon}</Text>}
            label="Category"
            value={category?.name}
            // Add onPress to open category picker later
          />
          {/* List */}
          <FormRow
            icon={<ShoppingCart size={20} color={COLORS.text_light} />}
            label="List"
            value={listName}
          />
          {/* Note Input */}
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
              onBlur={() => handleFieldUpdate('note', note)} // Save on blur
              onFocus={() => setIsNoteFocused(true)}
            />
          </View>

          {/* Static Rows */}
          <FormRow
            icon={<User size={20} color={COLORS.text_light} />}
            label="Assign to"
          />
          <FormRow
            icon={<Calendar size={20} color={COLORS.text_light} />}
            label="Set date"
          />
          <FormRow
            icon={<Bell size={20} color={COLORS.text_light} />}
            label="Add reminder"
          />
          <FormRow
            icon={<Repeat size={20} color={COLORS.text_light} />}
            label="Repeat"
          />
          <FormRow
            icon={<ImageIcon size={20} color={COLORS.text_light} />}
            label="Add photo"
          />
        </View>

        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={20} color={COLORS.text_light} />
        </TouchableOpacity>

        {item.updatedAt && (
          <Text style={styles.footerText}>
            Updated {item.updatedAt.toDate().toLocaleDateString()}
          </Text>
        )}
      </ScrollView>

      {/* Comment Bar (static) - only show if note is not focused */}
      {!isNoteFocused && (
        <View style={styles.commentBar}>
          <Text style={styles.commentInput}>Add a comment</Text>
          <TouchableOpacity>
            <Text style={styles.commentSend}>▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_modal,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background_modal,
  },
  errorText: {
    color: COLORS.text_danger,
    fontSize: FONT_SIZES.md,
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
    fontWeight: '600',
    color: COLORS.text_dark,
    height: 40,
  },
  textInputCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.text_light,
    fontWeight: 'normal',
  },
  // --- Footer ---
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: SPACING.lg,
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.text_light,
    fontSize: FONT_SIZES.sm,
  },
  // --- Comment Bar ---
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentInput: {
    flex: 1,
    color: COLORS.text_light,
    fontSize: FONT_SIZES.md,
  },
  commentSend: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
});

export default ItemDetailScreen;