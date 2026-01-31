import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Clock,
  Users,
  Utensils,
  Edit2,
  Trash2,
  CalendarPlus,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamily } from '../../hooks/useFamily';
import { deleteRecipe, useFamilyDocument } from '../../services/firestore';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const InfoPill = ({ icon, label }) => (
  <View style={styles.infoPill}>
    {icon}
    <Text style={styles.infoPillText}>{label}</Text>
  </View>
);

const RecipeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { familyId } = useFamily();

  // 1. Get params safely. 
  // 'recipe' might be the full object (from RecipeBox) OR just { id, title } (from MealPlanner)
  const { recipeId, recipe: initialRecipeData } = route.params || {};

  // 2. Fetch the latest full recipe data from Firestore
  // This ensures we get ingredients/instructions if we only started with an ID
  const activeId = recipeId || (initialRecipeData ? initialRecipeData.id : null);
  
  const { data: fetchedRecipe, loading } = useFamilyDocument(
    activeId ? `recipes/${activeId}` : null
  );

  // 3. Merge data: Use fetched data if available, otherwise fallback to params
  const recipe = fetchedRecipe || initialRecipeData;

  const handleEdit = () => {
    // Pass the full recipe object to edit screen
    if (recipe) {
      navigation.navigate('EditRecipe', { recipe, mode: 'edit' });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            if (activeId) {
              await deleteRecipe(familyId, activeId);
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const handleAddToMealPlan = () => {
    navigation.navigate('AddRecipeToMealPlanner', { recipe });
  };

  // 4. Loading State
  if (loading && !recipe) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 5. Error State
  if (!recipe) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>Recipe not found.</Text>
        <TouchableOpacity style={styles.planButton} onPress={() => navigation.goBack()}>
             <Text style={styles.planButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {recipe.photoUrl ? (
            <Image source={{ uri: recipe.photoUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Utensils size={60} color={COLORS.white} />
            </View>
          )}
          
          {/* Floating Header Buttons */}
          <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.iconButton, { marginRight: 8 }]} onPress={handleEdit}>
                <Edit2 size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(255,0,0,0.4)' }]} onPress={handleDelete}>
                <Trash2 size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          {/* Meta Info Row */}
          <View style={styles.metaRow}>
            {recipe.cookTime && (
              <InfoPill 
                icon={<Clock size={16} color={COLORS.text_light} />} 
                label={recipe.cookTime} 
              />
            )}
            {recipe.servings && (
              <InfoPill 
                icon={<Users size={16} color={COLORS.text_light} />} 
                label={`${recipe.servings} servings`} 
              />
            )}
          </View>

          <View style={styles.divider} />

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients && recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ing, index) => {
              // Handle legacy string vs new structured object format
              let text = '';
              if (typeof ing === 'string') {
                text = ing;
              } else {
                const qty = ing.qty ? ing.qty + ' ' : '';
                const unit = (ing.unit && ing.unit !== 'no') ? ing.unit + ' ' : '';
                text = `${qty}${unit}${ing.name}`;
              }

              return (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bodyText}>{text}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No ingredients listed.</Text>
          )}

          <View style={styles.divider} />

          {/* Instructions */}
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            recipe.instructions.map((step, index) => (
              <View key={index} style={styles.instructionRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.bodyText}>{step}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No instructions listed.</Text>
          )}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || SPACING.lg }]}>
        <TouchableOpacity 
          style={styles.planButton}
          onPress={handleAddToMealPlan}
        >
          <CalendarPlus size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.planButtonText}>Add to Meal Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.2)', // gradient-like overlay
  },
  iconButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background_white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24, // Overlap the image slightly
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background_light,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: SPACING.md,
  },
  infoPillText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_dark,
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginBottom: SPACING.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.orange,
    marginRight: SPACING.md,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.orange,
    marginRight: SPACING.md,
    width: 20,
  },
  bodyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    flex: 1,
  },
  emptyText: {
    color: COLORS.text_light,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  planButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADII.lg,
  },
  planButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});

export default RecipeDetailScreen;