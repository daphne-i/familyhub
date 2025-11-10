import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Settings,
  ChevronDown,
  List,
  CalendarDays,
  PiggyBank,
  Folder,
  Salad,
  CookingPot,
  User,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
// We don't have useFamily yet, but we will soon.
// For now, we'll just use the user's name.
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII, FONTS } = theme;

// Helper component for the user avatar
const UserAvatar = () => (
  <View style={styles.avatarContainer}>
    <User size={FONT_SIZES.lg} color={COLORS.primary} />
  </View>
);

// Re-usable Tile Component
const FeatureTile = ({ title, subtitle, icon, onPress, color = COLORS.primary }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <View style={styles.tileHeader}>
      <Text style={styles.tileTitle}>{title}</Text>
      <View style={[styles.tileIconContainer, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
    </View>
    <Text style={styles.tileSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const HubScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth(); // Get user data

  // Placeholder navigation
  const goTo = (screen) => {
    // In the future, this will be: navigation.push(screen)
    console.log(`Maps to ${screen}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background_white }]}>
      {/* === Custom Header (as per Section 5.2) === */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity style={styles.headerUser}>
          <UserAvatar />
          <Text style={styles.headerTitle}>
            {user?.displayName || 'Family'}
          </Text>
          <ChevronDown size={FONT_SIZES.lg} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goTo('Settings')}>
          <Settings size={FONT_SIZES.xl} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* === Feature Grid === */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.tileGrid}>
          {/* Lists */}
          <FeatureTile
            title="Lists"
            subtitle="2 lists" // Static data for now
            icon={<List size={24} color={COLORS.primary} />}
            onPress={() => goTo('Lists')}
            color={COLORS.primary}
          />
          {/* Calendar */}
          <FeatureTile
            title="Calendar"
            subtitle="2 events today" // Static data
            icon={<CalendarDays size={24} color={COLORS.green} />}
            onPress={() => goTo('Calendar')}
            color={COLORS.green}
          />
          {/* Budget */}
          <FeatureTile
            title="Budget"
            subtitle="Manage your Budgets"
            icon={<PiggyBank size={24} color={COLORS.purple} />}
            onPress={() => goTo('Budget')}
            color={COLORS.purple}
          />
          {/* Documents */}
          <FeatureTile
            title="Documents"
            subtitle="4 folders 1 file" // Static data
            icon={<Folder size={24} color={COLORS.orange} />}
            onPress={() => goTo('Documents')}
            color={COLORS.orange}
          />
          {/* Meals */}
          <FeatureTile
            title="Meals"
            subtitle="1 meal this week" // Static data
            icon={<Salad size={24} color={COLORS.primary} />}
            onPress={() => goTo('MealPlanner')}
            color={COLORS.primary}
          />
          {/* Recipes */}
          <FeatureTile
            title="Recipes"
            subtitle="7 recipes" // Static data
            icon={<CookingPot size={24} color={COLORS.orange} />}
            onPress={() => goTo('RecipeBox')}
            color={COLORS.orange}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background_white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginRight: SPACING.xs,
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
    width: '48%',
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tileTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.xs,
  },
  tileIconContainer: {
    padding: SPACING.sm,
    borderRadius: RADII.full,
  },
  tileSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text_light,
    marginTop: SPACING.xl,
  },
});

export default HubScreen;