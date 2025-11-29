import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Clock,
  Users,
  Utensils,
  MoreVertical,
  CalendarPlus,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';

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
  const { recipe } = route.params;

  const handleEdit = () => {
    navigation.navigate('EditRecipe', { recipe, mode: 'edit' });
  };

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
            <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
              <MoreVertical size={24} color={COLORS.white} />
            </TouchableOpacity>
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
            recipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.bodyText}>{ing}</Text>
              </View>
            ))
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
          onPress={() => navigation.navigate('AddRecipeToMealPlanner', { recipe })}
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
    backgroundColor: 'rgba(0,0,0,0.3)', // gradient-like overlay
  },
  iconButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
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