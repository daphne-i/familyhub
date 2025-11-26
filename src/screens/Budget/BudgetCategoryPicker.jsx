import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../../constants';
// 1. Re-import Firestore hooks
import { useFamilyCollection, addBudgetCategory } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import CreateBudgetEntityModal from './CreateBudgetEntityModal';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const BudgetCategoryPicker = ({
  visible,
  onClose,
  onSelect,
  type, // 'Expense' or 'Income'
}) => {
  const { familyId } = useFamily();
  // 2. Fetch custom categories
  const { data: customCategories } = useFamilyCollection('budgetCategories');
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  // 3. Merge Defaults + Custom
  const data = useMemo(() => {
    const defaults = type === 'Income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    
    // Filter custom categories by type (if you implemented type saving for custom ones)
    const relevantCustom = customCategories ? customCategories.filter(c => !c.type || c.type === type) : [];

    return [
      ...defaults,
      ...relevantCustom,
      { id: 'new', name: 'New', icon: 'plus' } // Button at the end
    ];
  }, [type, customCategories]);

  const handleCreate = async (newCategory) => {
    try {
      await addBudgetCategory(familyId, newCategory);
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (item.id === 'new') {
          setCreateModalVisible(true);
        } else {
          onSelect(item);
          onClose();
        }
      }}>
      <View
        style={[
          styles.iconContainer,
          item.id === 'new' && styles.iconContainerNew,
        ]}>
        {item.id === 'new' ? (
          <Plus size={28} color={COLORS.text_dark} />
        ) : (
          <Text style={styles.emojiIcon}>{item.icon}</Text>
        )}
      </View>
      <Text style={styles.itemText} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Pick a {type ? type.toLowerCase() : 'category'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={4}
          contentContainerStyle={styles.listContent}
        />

        {/* 4. Restore the Modal */}
        <CreateBudgetEntityModal 
            visible={isCreateModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSave={handleCreate}
            title={`New ${type} Category`}
            entityType={type}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  itemContainer: {
    width: '25%',
    alignItems: 'center',
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  iconContainerNew: {
    backgroundColor: COLORS.border,
  },
  emojiIcon: {
    fontSize: 28,
    color: COLORS.text_dark,
  },
  itemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_dark,
    textAlign: 'center',
    height: 32,
  },
});

export default BudgetCategoryPicker;