import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Lock,
  MoreHorizontal,
  Plus,
  ChevronDown,
  ChevronUp, // 1. IMPORT ChevronUp
  CheckSquare,
  Square,
  Calendar,
  Repeat,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection, updateListItem } from '../../services/firestore';
import {
  SHOPPING_CATEGORIES,
  TODO_DEFAULT_CATEGORIES,
} from '../../constants';
import { useFamily } from '../../hooks/useFamily';
import MemberAvatar from '../Common/MemberAvatar';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const CustomHeader = ({ listName, listColor, listIcon }) => {
  // ... (This component remains the same)
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top, backgroundColor: listColor },
      ]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{listName}</Text>
        <Text style={styles.headerIcon}>{listIcon}</Text>
      </View>
      <TouchableOpacity style={styles.headerButton}>
        <Lock size={FONT_SIZES.lg} color={COLORS.text_dark} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton}>
        <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const AddItemButton = ({ onPress }) => (
  // ... (This component remains the same)
  <TouchableOpacity style={styles.addItemButton} onPress={onPress}>
    <Plus size={22} color={COLORS.primary} />
    <Text style={styles.addItemText}>Add an item</Text>
  </TouchableOpacity>
);

// 2. UPDATE SectionHeader to accept new props
const SectionHeader = ({ section, onToggle, isCollapsed }) => (
  <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
    <Text style={styles.sectionIcon}>{section.icon}</Text>
    <Text style={styles.sectionTitle}>{section.title}</Text>
    <Text style={styles.sectionCount}>{section.count}</Text>
    {isCollapsed ? (
      <ChevronUp size={18} color={COLORS.text_light} />
    ) : (
      <ChevronDown size={18} color={COLORS.text_light} />
    )}
  </TouchableOpacity>
);

const formatItemDate = (date) => {
  // ... (This helper function remains the same)
  if (!date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = date.toDate();
  const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

  const timeString = itemDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (itemDateOnly.getTime() === today.getTime()) {
    return `Today, ${timeString}`;
  }
  
  const daysDiff = (itemDateOnly.getTime() - today.getTime()) / (1000 * 3600 * 24);
  if (daysDiff > 0 && daysDiff < 7) {
    const weekday = itemDate.toLocaleDateString(undefined, { weekday: 'long' });
    return `${weekday}, ${timeString}`;
  }

  const dateString = itemDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${dateString}, ${timeString}`;
};

const ListItem = ({ item, onToggle, onPress }) => {
  // ... (This component remains the same)
  const itemDueDate = item.dueDate ? formatItemDate(item.dueDate) : null;
  const showRepeat = item.repeat && item.repeat !== 'One time only';

  return (
    <View style={styles.itemWrapper}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
        {item.completed ? (
          <CheckSquare size={24} color={COLORS.primary} />
        ) : (
          <Square size={24} color={COLORS.text_light} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemTextContainer} onPress={onPress}>
        <Text
          style={[
            styles.itemText,
            item.completed && styles.itemTextCompleted,
          ]}>
          {item.name}
        </Text>
        
        <View style={styles.metaRow}>
          {itemDueDate && (
            <View style={styles.metaChip}>
              <Calendar size={14} color={COLORS.text_danger} />
              <Text style={styles.metaTextDanger}>{itemDueDate}</Text>
            </View>
          )}
          {showRepeat && (
            <View style={styles.metaChip}>
              <Repeat size={14} color={COLORS.text_light} />
              <Text style={styles.metaText}>{item.repeat}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <MemberAvatar memberId={item.assigneeId} />
    </View>
  );
};

// --- Main Screen ---

const ListDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { familyId } = useFamily();
  const { listId, listName, listType } = route.params;

  // 3. ADD STATE for collapsed sections
  const [collapsedSections, setCollapsedSections] = useState([]);

  const {
    data: items,
    loading,
    error,
  } = useFamilyCollection(`lists/${listId}/items`);

  const listColor =
    listType === 'shopping' ? COLORS.primary_light : COLORS.green_light;
  const listIcon = listType === 'shopping' ? '🛍️' : '📋';

  const handleToggleItem = async (item) => {
    // ... (This function remains the same)
    try {
      await updateListItem(familyId, listId, item.id, {
        completed: !item.completed,
      });
    } catch (e) {
      console.error('Failed to toggle item:', e);
    }
  };

  // 4. ADD HANDLER to toggle a section
  const toggleSection = (sectionTitle) => {
    setCollapsedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((t) => t !== sectionTitle) // Remove it (expand)
        : [...prev, sectionTitle] // Add it (collapse)
    );
  };

  // 5. UPDATE useMemo to use the new state
  const sections = useMemo(() => {
    if (!items) return [];
    
    const sortedItems = [...items].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.toDate() - b.createdAt.toDate();
    });

    const categories =
      listType === 'shopping'
        ? SHOPPING_CATEGORIES
        : TODO_DEFAULT_CATEGORIES;

    const grouped = sortedItems.reduce((acc, item) => {
      const categoryId = item.category || 'uncategorized';
      if (!acc[categoryId]) {
        const catInfo = categories.find((c) => c.id === categoryId) || {
          id: 'uncategorized',
          name: 'Uncategorized',
          icon: '🏷️',
        };

        acc[categoryId] = {
          title: catInfo.name,
          icon: catInfo.icon,
          count: 0,
          data: [],
        };
      }
      acc[categoryId].data.push(item);
      acc[categoryId].count++;
      return acc;
    }, {});

    // 6. MAP over sections to set data to [] if collapsed
    return Object.values(grouped).map((section) => ({
      ...section,
      data: collapsedSections.includes(section.title) ? [] : section.data,
    }));
  }, [items, listType, collapsedSections]); // 7. ADD collapsedSections to dependency array

  const renderList = () => {
    // ... (This function remains the same)
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading items.</Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            item={item}
            onToggle={() => handleToggleItem(item)}
            onPress={() =>
              navigation.push('ItemDetail', {
                itemId: item.id,
                listId: listId,
                listType: listType,
                listName: listName,
              })
            }
          />
        )}
        // 8. UPDATE renderSectionHeader to pass new props
        renderSectionHeader={({ section }) => (
          <SectionHeader
            section={section}
            isCollapsed={collapsedSections.includes(section.title)}
            onToggle={() => toggleSection(section.title)}
          />
        )}
        ListHeaderComponent={
          <AddItemButton
            onPress={() =>
              navigation.navigate('AddItem', {
                listId: listId,
                listType: listType,
              })
            }
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No items in this list yet.</Text>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        stickySectionHeadersEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        listName={listName}
        listColor={listColor}
        listIcon={listIcon}
      />
      {renderList()}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('AddItem', {
            listId: listId,
            listType: listType,
          })
        }>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

// ... (Styles remain exactly the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  headerIcon: {
    fontSize: FONT_SIZES.lg,
    marginLeft: SPACING.sm,
  },
  // --- Add Item ---
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginLeft: SPACING.md,
    fontWeight: '600',
  },
  // --- Section Header ---
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm, // <--- CHANGED FROM SPACING.lg
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
    sectionIcon: {
    fontSize: FONT_SIZES.base, // Changed from md to base (14)
  },
  sectionTitle: {
    flex: 1,
    fontSize: FONT_SIZES.base, // Changed from md to base (14)
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginLeft: SPACING.md,
  },
  sectionCount: {
    fontSize: FONT_SIZES.base, // Changed from md to base (14)
    color: COLORS.text_light,
    fontWeight: 'normal',
    marginRight: SPACING.sm,
  },

  // --- List Item (NEW STYLES) ---
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkboxContainer: {
    paddingRight: SPACING.md,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: FONT_SIZES.md, // Larger font size
    color: COLORS.text_dark,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.text_light,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
    marginLeft: SPACING.xs,
  },
  metaTextDanger: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_danger,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  // --- Loading/Error States ---
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_danger,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
  },
});

export default ListDetailScreen;