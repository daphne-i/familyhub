import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Calendar as CalendarIcon, Sun, Moon, Coffee, Utensils } from 'lucide-react-native';
import { format, addDays, startOfToday } from 'date-fns';
import DateTimePickerModal from "react-native-modal-datetime-picker";

import * as theme from '../../utils/theme';
import { addMealItem } from '../../services/firestore'; // Using the same service function from Iteration 1
import { useFamily } from '../../hooks/useFamily';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#FF9800' },
  { id: 'lunch', label: 'Lunch', icon: Sun, color: '#FFC107' },
  { id: 'dinner', label: 'Dinner', icon: Moon, color: '#3F51B5' },
  { id: 'snack', label: 'Snacks', icon: Utensils, color: '#4CAF50' },
];

const AddRecipeToMealPlannerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { familyId } = useFamily();

  const { recipe } = route.params || {};

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState('dinner'); // Default to Dinner
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const handleSave = async () => {
    if (!recipe) return;
    
    setLoading(true);
    try {
      await addMealItem(familyId, {
        date: selectedDate,
        slot: selectedSlot,
        type: 'recipe',
        title: recipe.title,
        recipeId: recipe.id,
        isCompleted: false,
      });
      
      Alert.alert("Success", "Added to meal plan!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not add to meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Meal</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>When do you want to cook this?</Text>
        <Text style={styles.recipeName}>{recipe?.title}</Text>

        {/* Date Selector */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.dateSelector} 
          onPress={() => setDatePickerVisibility(true)}
        >
          <CalendarIcon size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
          <Text style={styles.dateText}>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</Text>
        </TouchableOpacity>

        {/* Slot Selector */}
        <Text style={styles.label}>Meal Time</Text>
        <View style={styles.slotsContainer}>
          {MEAL_SLOTS.map((slot) => {
            const Icon = slot.icon;
            const isSelected = selectedSlot === slot.id;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotCard,
                  isSelected && { borderColor: slot.color, backgroundColor: slot.color + '10' }
                ]}
                onPress={() => setSelectedSlot(slot.id)}
              >
                <Icon size={24} color={isSelected ? slot.color : COLORS.text_light} />
                <Text style={[
                  styles.slotText,
                  isSelected && { color: slot.color, fontWeight: 'bold' }
                ]}>
                  {slot.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: slot.color }]}>
                    <Check size={12} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={COLORS.white} />
          ) : (
             <Text style={styles.saveButtonText}>Add to Calendar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
        date={selectedDate}
      />
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
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  iconButton: { padding: SPACING.xs },
  content: { padding: SPACING.lg },
  question: { fontSize: FONT_SIZES.md, color: COLORS.text_light, marginBottom: SPACING.xs },
  recipeName: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.text_dark, marginBottom: SPACING.xl },
  
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text_dark, marginBottom: SPACING.sm, marginTop: SPACING.md },
  
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: { fontSize: FONT_SIZES.md, color: COLORS.text_dark },
  
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  slotCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  slotText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
  },
  checkCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});

export default AddRecipeToMealPlannerScreen;