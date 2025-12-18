import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Utensils, 
  Coffee, 
  Moon, 
  Sun,
  Trash2
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamily } from '../../hooks/useFamily';
import { useMealPlanRange, deleteMealItem } from '../../services/firestore';
import { addDays, startOfWeek, endOfWeek, format, isSameDay, startOfDay } from 'date-fns';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Constants ---
const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#FF9800' },
  { id: 'lunch', label: 'Lunch', icon: Sun, color: '#FFC107' },
  { id: 'dinner', label: 'Dinner', icon: Moon, color: '#3F51B5' },
  { id: 'snack', label: 'Snacks', icon: Utensils, color: '#4CAF50' },
];

// --- Components ---

const WeekCalendar = ({ selectedDate, onSelectDate }) => {
  // Generate current week based on selectedDate
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  const handlePrevWeek = () => onSelectDate(addDays(selectedDate, -7));
  const handleNextWeek = () => onSelectDate(addDays(selectedDate, 7));

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.navButton}>
          <ChevronLeft size={20} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
          <ChevronRight size={20} color={COLORS.text_dark} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekRow}>
        {weekDays.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          
          return (
            <TouchableOpacity
              key={date.toString()}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
                isToday && !isSelected && styles.dayButtonToday
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text style={[styles.dayName, isSelected && styles.textWhite]}>
                {format(date, 'EEE')}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.textWhite]}>
                {format(date, 'd')}
              </Text>
              {isToday && <View style={[styles.dot, isSelected && { backgroundColor: COLORS.white }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MealCard = ({ item, onDelete, onPress }) => (
  <TouchableOpacity style={styles.mealCard} onPress={onPress}>
    <View style={styles.mealContent}>
      <Text style={styles.mealTitle}>{item.title}</Text>
      {item.type === 'recipe' && (
        <View style={styles.recipeTag}>
          <Utensils size={10} color={COLORS.white} />
          <Text style={styles.recipeTagText}>Recipe</Text>
        </View>
      )}
    </View>
    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
      <Trash2 size={16} color={COLORS.text_light} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const MealSlot = ({ slot, meals, onAdd, onDeleteItem, onEditItem }) => {
  const Icon = slot.icon;
  
  return (
    <View style={styles.slotContainer}>
      <View style={styles.slotHeader}>
        <View style={[styles.slotIconBg, { backgroundColor: slot.color + '20' }]}>
          <Icon size={18} color={slot.color} />
        </View>
        <Text style={styles.slotTitle}>{slot.label}</Text>
        <TouchableOpacity onPress={onAdd} style={styles.addButton}>
          <Plus size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {meals.length > 0 ? (
        meals.map(meal => (
          <MealCard 
            key={meal.id} 
            item={meal} 
            onDelete={() => onDeleteItem(meal)}
            onPress={() => onEditItem(meal)}
          />
        ))
      ) : (
        <Text style={styles.emptySlotText}>Nothing planned</Text>
      )}
    </View>
  );
};

// --- Main Screen ---

const MealPlannerScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { familyId } = useFamily();
  
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch meals for the whole week to handle sliding (optimization)
  // For simplicity, we just fetch a buffer around selected date
  const startDate = startOfDay(selectedDate); // Fetching just today for now to keep logic simple
  const endDate = addDays(startDate, 1); // effectively just this day 
  // Ideally fetch the whole week:
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const { data: weeklyMeals, loading } = useMealPlanRange(weekStart, weekEnd);

  // Filter meals for the specific selected day
  const todaysMeals = useMemo(() => {
    if (!weeklyMeals) return [];
    return weeklyMeals.filter(m => {
      const d = m.date.toDate ? m.date.toDate() : new Date(m.date);
      return isSameDay(d, selectedDate);
    });
  }, [weeklyMeals, selectedDate]);

  const handleDeleteItem = (item) => {
    Alert.alert(
      "Remove Meal",
      `Remove ${item.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: () => deleteMealItem(familyId, item.id) 
        }
      ]
    );
  };

  const handleAddItem = (slotId) => {
    // Navigate to DishPicker (we will build this next)
    navigation.navigate('DishPicker', { 
      date: selectedDate.toISOString(), 
      slot: slotId 
    });
  };

  const handleEditItem = (item) => {
    // If it's a recipe, maybe go to recipe detail? 
    // For manual, maybe edit text.
    if (item.type === 'recipe' && item.recipeId) {
      navigation.navigate('RecipeDetail', { 
        recipeId: item.recipeId,
        // We need to fetch the full recipe, usually stored in item or fetched there
        // For MVP, assuming item contains minimal recipe snapshot or we fetch in detail
        recipe: { ...item, id: item.recipeId, title: item.title } 
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Dashboard')}>
          <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Planner</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
      </View>

      <WeekCalendar 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate} 
      />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {MEAL_SLOTS.map(slot => {
            const mealsInSlot = todaysMeals.filter(m => m.slot === slot.id);
            return (
              <MealSlot 
                key={slot.id}
                slot={slot}
                meals={mealsInSlot}
                onAdd={() => handleAddItem(slot.id)}
                onDeleteItem={handleDeleteItem}
                onEditItem={handleEditItem}
              />
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  // Calendar Styles
  calendarContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  navButton: {
    padding: SPACING.sm,
  },
  monthTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text_dark,
    width: 150,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.sm,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 8,
    width: 45,
    borderRadius: 12,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  dayButtonToday: {
    backgroundColor: COLORS.background_light,
  },
  dayName: {
    fontSize: 12,
    color: COLORS.text_light,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  textWhite: {
    color: COLORS.white,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  // Slot Styles
  content: {
    padding: SPACING.lg,
  },
  slotContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  slotIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  slotTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  addButton: {
    padding: 4,
  },
  emptySlotText: {
    color: COLORS.text_light,
    fontStyle: 'italic',
    fontSize: FONT_SIZES.sm,
    marginLeft: 48, // Align with title
  },
  // Meal Card
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginLeft: 48, // Indent
    marginBottom: SPACING.sm,
  },
  mealContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    fontWeight: '500',
  },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  recipeTagText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
});

export default MealPlannerScreen;