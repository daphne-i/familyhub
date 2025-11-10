import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  List,
  CalendarDays,
  CreditCard,
  Folder,
  Utensils, // Changed from Salad
  Soup, // Changed from BookOpen
  Settings,
  ChevronDown,
  User,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// Reusable Tile Component
const HubTile = ({ title, subtitle, icon, iconBgColor, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: iconBgColor || COLORS.border }]}>
      {icon}
    </View>
    <View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// Custom Header
const HubHeader = ({ onSettingsPress }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
      <View style={styles.headerLeft}>
        <View style={styles.avatarContainer}>
          <User size={FONT_SIZES.lg} color={COLORS.primary} />
        </View>
        <TouchableOpacity style={styles.nameContainer}>
          <Text style={styles.nameText}>{user?.displayName || 'Family'}</Text>
          <ChevronDown size={FONT_SIZES.md} color={COLORS.text_light} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
        <Settings size={24} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const HubScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <HubHeader onSettingsPress={() => navigation.push('Settings')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Lists */}
          <HubTile
            title="Lists"
            subtitle="2 lists" // static
            icon={<List size={30} color={COLORS.primary} />}
            iconBgColor={COLORS.primary_light}
            onPress={() => navigation.push('Lists')}
          />
          {/* Calendar */}
          <HubTile
            title="Calendar"
            subtitle="2 events today" // static
            icon={<CalendarDays size={30} color={COLORS.green} />}
            iconBgColor={COLORS.green_light}
            onPress={() => navigation.push('Calendar')}
          />
          {/* Budget */}
          <HubTile
            title="Budget"
            subtitle="Manage your Budgets"
            icon={<CreditCard size={30} color={COLORS.purple} />}
            iconBgColor={COLORS.purple_light}
            onPress={() => navigation.push('Budget')}
          />
          {/* Documents */}
          <HubTile
            title="Documents"
            subtitle="4 folders 1 file" // static
            icon={<Folder size={30} color={COLORS.orange} />}
            iconBgColor={COLORS.orange_light}
            onPress={() => navigation.push('Documents')}
          />

          {/* === FIX IS HERE === */}
          {/* Meals */}
          <HubTile
            title="Meals"
            subtitle="1 meal this week" // static
            icon={<Utensils size={30} color={COLORS.blue} />}
            iconBgColor={COLORS.blue_light}
            onPress={() => navigation.push('MealPlanner')}
          />
          {/* Recipes */}
          <HubTile
            title="Recipes"
            subtitle="7 recipes" // static
            icon={<Soup size={30} color={COLORS.orange} />}
            iconBgColor={COLORS.orange_light}
            onPress={() => navigation.push('RecipeBox')}
          />
          {/* === END FIX === */}

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  headerLeft: {
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
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  nameText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginRight: SPACING.xs,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  // --- Grid ---
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADII.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  tileTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.xs,
  },
  tileSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
  },
});

export default HubScreen;