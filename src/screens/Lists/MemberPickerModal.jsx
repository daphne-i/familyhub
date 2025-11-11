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
import { X, User } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamily } from '../../hooks/useFamily';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// Helper to get initials
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '');
};

const MemberPickerModal = ({ visible, onClose, onSelect }) => {
  const { membersList } = useFamily(); // Get members from our context

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        onSelect(item);
        onClose();
      }}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.displayName)}</Text>
      </View>
      <Text style={styles.itemText}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assign to</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={membersList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
  },
});

export default MemberPickerModal;