import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;
const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - SPACING.lg * 3) / 2;

// Re-usable List Tile Component
const ListCard = ({ title, subtitle, icon, onPress, color, iconBg }) => (
  <TouchableOpacity
    style={[styles.tile, { backgroundColor: color }]}
    onPress={onPress}>
    <View style={styles.tileIconContainer}>
      {/* This is a placeholder for the image/icon in your screenshot */}
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.tileIconText}>{icon}</Text>
      </View>
    </View>
    <Text style={styles.tileTitle}>{title}</Text>
    <Text style={styles.tileSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ListsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* === Custom Header === */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lists</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
      </View>

      {/* === List Grid === */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.tileGrid}>
          {/* Shopping List */}
          <ListCard
            title="Shopping"
            subtitle="19 items"
            icon="🛍️" // Placeholder icon
            color={COLORS.primary_light}
            iconBg="rgba(255,255,255,0.4)"
            onPress={() => navigation.push('ListDetail')}
          />
          {/* To Do's List */}
          <ListCard
            title="To Do's"
            subtitle="2 items"
            icon="📋" // Placeholder icon
            color={COLORS.green_light}
            iconBg="rgba(255,255,255,0.4)"
            onPress={() => navigation.push('ListDetail')}
          />
        </View>
      </ScrollView>

      {/* === FAB === */}
      <TouchableOpacity style={styles.fab}>
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
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  // --- Grid ---
  scrollContent: {
    padding: SPACING.lg,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // --- Tile ---
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.1, // Make them slightly taller
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tileIconContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tileIcon: {
    width: 60,
    height: 60,
    borderRadius: RADII.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileIconText: {
    fontSize: 30, // Emoji size
  },
  tileTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  tileSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
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
});

export default ListsScreen;