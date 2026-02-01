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
import { 
  Bell, 
  Calendar as CalendarIcon, 
  Wallet, 
  Utensils, 
  ArrowRight,
  CheckCircle2,
  Settings,
  AlertCircle
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { format } from 'date-fns';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const QuickAction = ({ icon: Icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Fetch real data from the hook
  const { events, todaysMeals, budgetSummary } = useDashboard();

  // Logic: Find the next relevant meal (Breakfast -> Lunch -> Dinner -> Snack)
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
  const nextMeal = todaysMeals && todaysMeals.length > 0 
    ? todaysMeals.sort((a, b) => mealOrder.indexOf(a.slot) - mealOrder.indexOf(b.slot))[0] 
    : null;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <View>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'Member'}!</Text>
        </View>
<TouchableOpacity 
    style={styles.profileBtn}
    onPress={() => navigation.navigate('Settings')} 
  >
     <Settings size={24} color={COLORS.text_dark} />
  </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <QuickAction 
            icon={CalendarIcon} 
            label="Calendar" 
            color="#4CAF50" 
            onPress={() => navigation.navigate('Calendar')} 
          />
          <QuickAction 
            icon={Utensils} 
            label="Meals" 
            color="#FF9800" 
            onPress={() => navigation.navigate('MealPlanner')} 
          />
          <QuickAction 
            icon={Wallet} 
            label="Budget" 
            color="#2196F3" 
            onPress={() => navigation.navigate('Budget')} 
          />
        </View>

        {/* Section: Today's Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {events.length > 0 ? (
            events.map(event => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => navigation.navigate('Calendar')}
              >
                <View style={[styles.eventBar, { backgroundColor: event.color || COLORS.primary }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTime}>
                    {format(event.startTime, 'h:mm a')}
                  </Text>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <CheckCircle2 size={24} color={COLORS.text_light} />
              <Text style={styles.emptyStateText}>No events today</Text>
            </View>
          )}
        </ScrollView>

        {/* Section: Up Next to Eat */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Up Next to Eat</Text>
        <TouchableOpacity 
          style={styles.dinnerCard}
          onPress={() => navigation.navigate('MealPlanner')}
        >
          <View style={styles.dinnerContent}>
             <View style={styles.dinnerIcon}>
                <Utensils size={20} color={COLORS.white} />
             </View>
             <View>
               <Text style={styles.dinnerLabel}>
                 {nextMeal ? (nextMeal.slot.charAt(0).toUpperCase() + nextMeal.slot.slice(1)) : "Meal Plan"}
               </Text>
               <Text style={styles.dinnerTitle}>
                 {nextMeal ? nextMeal.title : "Nothing planned for today"}
               </Text>
             </View>
          </View>
          <ArrowRight size={20} color={COLORS.text_dark} />
        </TouchableOpacity>

        {/* Section: Monthly Budget */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Monthly Budget</Text>
        <TouchableOpacity 
          style={styles.budgetCard}
          onPress={() => navigation.navigate('Budget')}
        >
          {budgetSummary ? (
            <View style={styles.budgetRow}>
              <View>
                 <Text style={styles.budgetLabel}>Remaining</Text>
                 <Text style={[
                   styles.budgetAmount, 
                   { color: budgetSummary.remaining < 0 ? COLORS.text_danger : COLORS.primary }
                 ]}>
                   ₹{budgetSummary.remaining.toFixed(2)}
                 </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                 <Text style={styles.budgetLabel}>Limit</Text>
                 <Text style={styles.budgetLimit}>₹{budgetSummary.limit}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noBudgetState}>
               <AlertCircle size={24} color={COLORS.text_light} />
               <Text style={styles.emptyStateText}>No budget set for this month</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background_white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  date: { fontSize: FONT_SIZES.sm, color: COLORS.text_light, textTransform: 'uppercase', letterSpacing: 1 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: COLORS.text_dark },
  profileBtn: { padding: SPACING.sm, backgroundColor: COLORS.background_light, borderRadius: 20 },
  
  content: { padding: SPACING.lg },
  
  // Quick Actions
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  quickAction: { alignItems: 'center', width: '30%' },
  quickActionIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text_dark },
  
  // Section Headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  seeAll: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },

  // Events
  horizontalScroll: { overflow: 'visible' },
  eventCard: {
    width: 140,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    marginRight: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventBar: { width: 6, height: '100%' },
  eventContent: { padding: SPACING.sm, flex: 1, justifyContent: 'center' },
  eventTime: { fontSize: FONT_SIZES.xs, color: COLORS.text_light, marginBottom: 4 },
  eventTitle: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.text_dark },
  emptyStateCard: {
    width: 140,
    height: 100,
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  emptyStateText: { color: COLORS.text_light, fontSize: FONT_SIZES.sm, marginTop: 4 },

  // Meal Card
  dinnerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dinnerContent: { flexDirection: 'row', alignItems: 'center' },
  dinnerIcon: { 
    width: 40, height: 40, 
    borderRadius: 20, 
    backgroundColor: COLORS.orange, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: SPACING.md
  },
  dinnerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.text_light, textTransform: 'capitalize' },
  dinnerTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text_dark },

  // Budget Card
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text_light, marginBottom: 4 },
  budgetAmount: { fontSize: 24, fontWeight: 'bold' },
  budgetLimit: { fontSize: FONT_SIZES.lg, color: COLORS.text_dark, fontWeight: '500' },
  noBudgetState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: SPACING.sm }
});

export default DashboardScreen;