import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X, Search, Utensils, Type } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection, addMealItem } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import { format } from 'date-fns';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const DishPickerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { familyId } = useFamily();
  
  // Get params passed from MealPlannerScreen
  const { date, slot } = route.params || {};
  
  // 'recipe' or 'manual'
  const [mode, setMode] = useState('recipe'); 
  const [manualText, setManualText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch recipes
  const { data: recipes, loading: loadingRecipes } = useFamilyCollection('recipes');

  // Filter recipes based on search
  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => navigation.goBack();

  const handleSave = async (type, title, recipeId = null) => {
    if (!title.trim()) return;
    
    setSubmitting(true);
    try {
      // Prepare the data object
      const mealData = {
        date: new Date(date), // Convert ISO string back to Date object
        slot: slot,           // 'breakfast', 'lunch', etc.
        type: type,           // 'recipe' or 'manual'
        title: title,
        isCompleted: false,
      };

      if (recipeId) {
        mealData.recipeId = recipeId;
      }

      await addMealItem(familyId, mealData);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to add meal:", error);
      alert("Could not save meal. Please try again.");
      setSubmitting(false);
    }
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleSave('recipe', item.title, item.id)}
    >
      <View style={styles.recipeIconBg}>
        <Utensils size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Add to {slot}</Text>
          <Text style={styles.headerSubtitle}>
            {format(new Date(date), 'MMM d, yyyy')}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={COLORS.text_dark} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, mode === 'recipe' && styles.activeTab]} 
          onPress={() => setMode('recipe')}
        >
          <Text style={[styles.tabText, mode === 'recipe' && styles.activeTabText]}>
            My Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, mode === 'manual' && styles.activeTab]} 
          onPress={() => setMode('manual')}
        >
          <Text style={[styles.tabText, mode === 'manual' && styles.activeTabText]}>
            Manual Entry
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT: Manual Mode */}
      {mode === 'manual' && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <Text style={styles.label}>What are you having?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Leftovers, Takeout, Sandwich"
              placeholderTextColor={COLORS.text_light}
              value={manualText}
              onChangeText={setManualText}
              autoFocus
            />
            <TouchableOpacity 
              style={[styles.saveButton, !manualText.trim() && styles.disabledButton]}
              onPress={() => handleSave('manual', manualText)}
              disabled={submitting || !manualText.trim()}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveButtonText}>Add to Plan</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* CONTENT: Recipe Mode */}
      {mode === 'recipe' && (
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.text_light} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              placeholderTextColor={COLORS.text_light}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loadingRecipes ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredRecipes}
              keyExtractor={item => item.id}
              renderItem={renderRecipeItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No recipes found.</Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background_white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark, textTransform: 'capitalize' },
  headerSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.text_light },
  closeButton: { padding: SPACING.xs },
  
  // Tabs
  tabContainer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text_light },
  activeTabText: { color: COLORS.primary },

  content: { flex: 1, padding: SPACING.lg },
  
  // Manual Input Styles
  label: { fontSize: FONT_SIZES.md, color: COLORS.text_dark, marginBottom: SPACING.sm, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    marginBottom: SPACING.xl,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADII.lg,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: COLORS.text_light },
  saveButtonText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: 'bold' },

  // Recipe List Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, height: 45, fontSize: FONT_SIZES.md, color: COLORS.text_dark },
  listContent: { paddingBottom: 20 },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADII.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  recipeIconBg: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background_light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recipeTitle: { fontSize: FONT_SIZES.md, color: COLORS.text_dark, fontWeight: '500' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.text_light, fontSize: FONT_SIZES.md },
});

export default DishPickerScreen;