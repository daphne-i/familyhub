import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  // 1. REMOVED SafeAreaView from react-native
} from 'react-native';
// 2. IMPORT THE HOOK
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  CheckSquare,
  DollarSign,
  Salad,
  User,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// Helper component for the user avatar
const UserAvatar = () => (
  <View style={styles.avatarContainer}>
    <User size={FONT_SIZES.xl} color={COLORS.text} />
  </View>
);

const DashboardScreen = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // 3. GET THE INSETS

  const today = new Date();
  const dateString = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    // 4. Use a regular <View> or <ScrollView> as the root
    <ScrollView
      style={[styles.container, { backgroundColor: COLORS.background_light }]}
      contentContainerStyle={[
        styles.scrollContent,
        // 5. APPLY PADDINGTOP DYNAMICALLY
        { paddingTop: insets.top + SPACING.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* === Welcome Header === */}
      <View style={styles.header}>
        <UserAvatar />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Good morning, {user?.displayName || 'User'}
          </Text>
          <Text style={styles.headerSubtitle}>{dateString}</Text>
        </View>
      </View>

      {/* === 2-Column Widget Grid === */}
      <View style={styles.widgetGrid}>
        {/* Today's Events Widget */}
        <View style={[styles.widgetCard, styles.halfWidth, styles.blueWidget]}>
          <View style={styles.widgetHeader}>
            <CalendarDays size={FONT_SIZES.lg} color={COLORS.primary} />
            <Text style={[styles.widgetTitle, { color: COLORS.primary }]}>
              Today's Events
            </Text>
          </View>
          <Text style={styles.widgetCount}>2 entries</Text>
          <View style={styles.widgetContent}>
            <Text style={styles.widgetItem}>7:00 – 8:00 Yoga Class</Text>
            <Text style={styles.widgetItem}>10:00 – 1:30 Standup Meeting</Text>
          </View>
        </View>

        {/* Pending Tasks Widget */}
        <View style={[styles.widgetCard, styles.halfWidth, styles.greenWidget]}>
          <View style={styles.widgetHeader}>
            <CheckSquare size={FONT_SIZES.lg} color={COLORS.green} />
            <Text style={[styles.widgetTitle, { color: COLORS.green }]}>
              Pending Tasks
            </Text>
          </View>
          <Text style={styles.widgetCount}>3 items</Text>
          <View style={styles.widgetContent}>
            <Text style={styles.widgetItem}>Pay electricity bill</Text>
            <Text style={styles.widgetItem}>Wash clothes</Text>
            <Text style={styles.widgetItem}>Buy groceries</Text>
          </View>
        </View>
      </View>

      {/* === Full-Width Widgets === */}
      {/* Budget Snapshot Widget */}
      <View style={[styles.widgetCard, styles.purpleWidget]}>
        <View style={styles.widgetHeader}>
          <DollarSign size={FONT_SIZES.lg} color={COLORS.purple} />
          <Text style={[styles.widgetTitle, { color: COLORS.purple }]}>
            Budget Snapshot
          </Text>
        </View>
        <Text style={styles.widgetCount}>1.250 / 3.3.000 spent</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
      </View>

      {/* Today's Meal Plan Widget */}
      <View style={[styles.widgetCard, styles.orangeWidget]}>
        <View style={styles.widgetHeader}>
          <Salad size={FONT_SIZES.lg} color={COLORS.orange} />
          <Text style={[styles.widgetTitle, { color: COLORS.orange }]}>
            Today's Meal Plan
          </Text>
        </View>
        <View style={styles.mealContent}>
          <Text style={styles.widgetCount}>No meal planned</Text>
          <View style={styles.mealImagePlaceholder}>
            <Salad size={FONT_SIZES.xxl} color={COLORS.orange} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // REMOVED safeArea style
  container: {
    flex: 1,
  },
  scrollContent: {
    // We removed the static padding from here
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
  },
  // --- Widget Grid ---
  widgetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  halfWidth: {
    width: '48%',
  },
  // --- Widget Card (Base) ---
  widgetCard: {
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  widgetTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  widgetCount: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  widgetContent: {},
  widgetItem: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text_light,
    marginBottom: SPACING.xs,
  },
  // --- Specific Widget Colors ---
  blueWidget: {
    backgroundColor: COLORS.primary_light,
  },
  greenWidget: {
    backgroundColor: COLORS.green_light,
  },
  purpleWidget: {
    backgroundColor: COLORS.purple_light,
  },
  orangeWidget: {
    backgroundColor: COLORS.orange_light,
  },
  // --- Budget Widget ---
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    marginTop: SPACING.sm,
  },
  progressBar: {
    width: '40%', // Dummy value
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: 4,
  },
  // --- Meal Widget ---
  mealContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen;