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
    CheckSquare,
    Square,
  } from 'lucide-react-native';
  import * as theme from '../../utils/theme';
  import { useFamilyCollection, updateListItem } from '../../services/firestore';
  import {
    SHOPPING_CATEGORIES,
    TODO_DEFAULT_CATEGORIES,
  } from '../../constants';
  import { useFamily } from '../../hooks/useFamily';

  const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

  // --- Components ---

  const CustomHeader = ({ listName, listColor, listIcon }) => {
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
    <TouchableOpacity style={styles.addItemButton} onPress={onPress}>
      <Plus size={22} color={COLORS.primary} />
      <Text style={styles.addItemText}>Add an item</Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ section }) => (
    <TouchableOpacity style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{section.icon}</Text>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.count}</Text>
      <ChevronDown size={18} color={COLORS.text_light} />
    </TouchableOpacity>
  );

  const ListItem = ({ item, onToggle, onPress }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={onToggle}>
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
        {item.createdAt && (
          <Text style={styles.itemTimestamp}>
            {item.createdAt.toDate().toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // --- Main Screen ---

  const ListDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { familyId } = useFamily();
    const { listId, listName, listType } = route.params;

    // FETCH ITEMS FROM THE SUBCOLLECTION
    const {
      data: items,
      loading,
      error,
    } = useFamilyCollection(`lists/${listId}/items`);

    // GET LIST STYLING
    const listColor =
      listType === 'shopping' ? COLORS.primary_light : COLORS.green_light;
    const listIcon = listType === 'shopping' ? '🛍️' : '📋';

    // FUNCTION TO HANDLE TOGGLING CHECKBOX
    const handleToggleItem = async (item) => {
      try {
        await updateListItem(familyId, listId, item.id, {
          completed: !item.completed,
        });
      } catch (e) {
        console.error('Failed to toggle item:', e);
        // You could show an error toast here
      }
    };

    // MEMOIZE AND GROUP THE DATA FOR THE SECTIONLIST
    const sections = useMemo(() => {
      if (!items) return [];
      
      // Sort items by creation date
      const sortedItems = [...items].sort((a, b) => {
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
          // Find category info from constants
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

      // Convert object to array
      return Object.values(grouped);
    }, [items, listType]);

    // RENDER LOADING OR ERROR
    const renderList = () => {
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

      // Pass real data to SectionList
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
                  listType: listType, // Pass listType here too
                  listName: listName, // Pass listName
                })
              }
            />
          )}
          renderSectionHeader={({ section }) => (
            <SectionHeader section={section} />
          )}
          ListHeaderComponent={
            <AddItemButton
              onPress={() =>
                navigation.navigate('AddItem', {
                  listId: listId,
                  listType: listType, // Pass listType to AddItemScreen
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
        {/* === FAB === */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate('AddItem', {
              listId: listId,
              listType: listType, // Pass listType to AddItemScreen
            })
          }>
          <Plus size={30} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background_white,
    },
    scrollContent: {
      paddingBottom: 100, // Room for FAB
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
      padding: SPACING.lg,
      backgroundColor: COLORS.background_white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    sectionIcon: {
      fontSize: FONT_SIZES.md,
    },
    sectionTitle: {
      flex: 1,
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: COLORS.text_dark,
      marginLeft: SPACING.md,
    },
    sectionCount: {
      fontSize: FONT_SIZES.md,
      color: COLORS.text_light,
      marginRight: SPACING.sm,
    },
    // --- List Item ---
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      backgroundColor: COLORS.white,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    itemTextContainer: {
      flex: 1,
      marginLeft: SPACING.md,
    },
    itemText: {
      fontSize: FONT_SIZES.md,
      color: COLORS.text_dark,
    },
    itemTextCompleted: {
      textDecorationLine: 'line-through',
      color: COLORS.text_light,
    },
    itemTimestamp: {
      fontSize: FONT_SIZES.sm,
      color: COLORS.text_light,
      marginTop: SPACING.xs,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
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