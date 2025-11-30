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
import { X } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const UNITS = [
  'no', 'cup', 'tbsp', 'tsp', 'g', 'kg', 'mL', 'L', 'packet', 'pcs', 'inch', 'cm', 'oz', 'lb'
];

const UnitPickerModal = ({ visible, onClose, onSelect }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        onSelect(item);
        onClose();
      }}>
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Unit</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={UNITS}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  container: {
    backgroundColor: COLORS.background_white,
    borderRadius: RADII.lg,
    maxHeight: '60%',
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
    padding: SPACING.sm,
  },
  itemContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background_light,
  },
  itemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
  },
});

export default UnitPickerModal;