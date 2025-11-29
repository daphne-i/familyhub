import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ChefHat, Link as LinkIcon, X } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const AddRecipeOptionsModal = ({ visible, onClose, onSelectManual, onSelectWeb }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>New Food Idea</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.card, { backgroundColor: COLORS.blue_light }]} onPress={onSelectManual}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Add your Own Recipe</Text>
              <Text style={styles.cardSubtitle}>Add your tasty grandma's apple pie or your genius creation.</Text>
            </View>
            <ChefHat size={40} color={COLORS.primary} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: COLORS.orange_light }]} onPress={onSelectWeb}>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Add a Web Recipe</Text>
              <Text style={styles.cardSubtitle}>Paste the url of a great recipe you found on the web to save it.</Text>
            </View>
            <LinkIcon size={40} color={COLORS.orange} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl + 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
    lineHeight: 18,
  },
  icon: {
    opacity: 0.8,
  },
});

export default AddRecipeOptionsModal;