import React from 'react';
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

const { COLORS, FONT_SIZES, SPACING } = theme;

const BudgetCategoryPicker = ({
  visible,
  onClose,
  onSelect,
  type, // 'Expense' or 'Income'
}) => {
  const categories =
    type === 'Income'
      ? DEFAULT_INCOME_CATEGORIES
      : DEFAULT_EXPENSE_CATEGORIES;

  // Add a "New" button with a special ID
  const data = [...categories, { id: 'new', name: 'New', icon: 'plus' }];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        onSelect(item);
        onClose();
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
    width: '25%', // 4 columns
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