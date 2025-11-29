import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  Camera, 
  XCircle 
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

import * as theme from '../../utils/theme';
import { addRecipe, updateRecipe, deleteRecipe } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_RECIPE_CATEGORIES } from '../../constants';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const EditRecipeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { familyId } = useFamily();
  const { user } = useAuth();
  
  const { mode, recipe } = route.params || {}; // mode: 'create' | 'edit'

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [cookTime, setCookTime] = useState(recipe?.cookTime || '');
  const [servings, setServings] = useState(recipe?.servings || '');
  const [photoUrl, setPhotoUrl] = useState(recipe?.photoUrl || null);
  
  // Dynamic Lists
  const [ingredients, setIngredients] = useState(recipe?.ingredients || []);
  const [instructions, setInstructions] = useState(recipe?.instructions || []);
  const [categoryIds, setCategoryIds] = useState(recipe?.categoryIds || []);

  // --- Handlers ---

  const handleImagePick = async () => {
    const result = await launchImageLibrary({ 
      mediaType: 'photo', 
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset) => {
    setLoading(true);
    try {
      const uri = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
      const filename = asset.fileName || `recipe_${Date.now()}.jpg`;
      const path = `families/${familyId}/recipe_images/${filename}`;
      
      const reference = storage().ref(path);
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      
      setPhotoUrl(url);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  // Ingredients Logic
  const addIngredient = () => setIngredients([...ingredients, '']);
  const updateIngredient = (text, index) => {
    const newArr = [...ingredients];
    newArr[index] = text;
    setIngredients(newArr);
  };
  const removeIngredient = (index) => {
    const newArr = ingredients.filter((_, i) => i !== index);
    setIngredients(newArr);
  };

  // Instructions Logic
  const addInstruction = () => setInstructions([...instructions, '']);
  const updateInstruction = (text, index) => {
    const newArr = [...instructions];
    newArr[index] = text;
    setInstructions(newArr);
  };
  const removeInstruction = (index) => {
    const newArr = instructions.filter((_, i) => i !== index);
    setInstructions(newArr);
  };

  // Category Logic
  const toggleCategory = (id) => {
    if (categoryIds.includes(id)) {
      setCategoryIds(categoryIds.filter(c => c !== id));
    } else {
      setCategoryIds([...categoryIds, id]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a recipe title.');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty rows
      const cleanIngredients = ingredients.filter(i => i && i.trim() !== '');
      const cleanInstructions = instructions.filter(i => i && i.trim() !== '');

      const recipeData = {
        title,
        description,
        cookTime,
        servings,
        photoUrl,
        ingredients: cleanIngredients,
        instructions: cleanInstructions,
        categoryIds,
        updatedBy: user.uid,
      };

      if (mode === 'create') {
        await addRecipe(familyId, { ...recipeData, createdBy: user.uid });
      } else {
        await updateRecipe(familyId, recipe.id, recipeData);
      }
      
      if (mode === 'edit') {
         navigation.navigate('RecipeBox');
      } else {
         navigation.goBack();
      }
      
    } catch (error) {
      console.error(error);
      // Show the actual error message
      Alert.alert('Error', `Failed to save recipe: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Recipe', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          setLoading(true);
          try {
            await deleteRecipe(familyId, recipe.id);
            navigation.navigate('RecipeBox');
          } catch(e) {
            Alert.alert('Error', 'Could not delete.');
            setLoading(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{mode === 'create' ? 'New Recipe' : 'Edit Recipe'}</Text>
        <View style={{ flexDirection: 'row' }}>
          {mode === 'edit' && (
            <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, { marginRight: 8 }]}>
              <Trash2 size={24} color={COLORS.text_danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.iconButton}>
            {loading ? <ActivityIndicator color={COLORS.primary} /> : <Check size={24} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Photo Picker */}
        <TouchableOpacity style={styles.photoContainer} onPress={handleImagePick}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={32} color={COLORS.text_light} />
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Grandma's Apple Pie"
          placeholderTextColor={COLORS.text_light}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Short description..."
          placeholderTextColor={COLORS.text_light}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: SPACING.md }}>
            <Text style={styles.label}>Time</Text>
            <TextInput 
              style={styles.input} 
              placeholder="30m" 
              placeholderTextColor={COLORS.text_light}
              value={cookTime} 
              onChangeText={setCookTime} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Servings</Text>
            <TextInput 
              style={styles.input} 
              placeholder="4" 
              placeholderTextColor={COLORS.text_light}
              value={servings} 
              onChangeText={setServings} 
            />
          </View>
        </View>

        {/* Categories */}
        <Text style={styles.label}>Categories</Text>
        <View style={styles.tagsContainer}>
          {DEFAULT_RECIPE_CATEGORIES.map((cat) => {
            const isSelected = categoryIds.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tag, isSelected && styles.tagSelected]}
                onPress={() => toggleCategory(cat.id)}>
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ingredients */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <TouchableOpacity onPress={addIngredient}>
            <Plus size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        {ingredients.map((ing, index) => (
          <View key={index} style={styles.dynamicRow}>
            <TextInput
              style={[styles.input, styles.dynamicInput]}
              placeholder={`Ingredient ${index + 1}`}
              placeholderTextColor={COLORS.text_light}
              value={ing}
              onChangeText={(t) => updateIngredient(t, index)}
            />
            <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeBtn}>
              <XCircle size={20} color={COLORS.text_light} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Instructions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <TouchableOpacity onPress={addInstruction}>
            <Plus size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        {instructions.map((inst, index) => (
          <View key={index} style={styles.dynamicRow}>
            <Text style={styles.stepNum}>{index + 1}.</Text>
            <TextInput
              style={[styles.input, styles.dynamicInput, { height: 'auto', minHeight: 40 }]}
              placeholder={`Step ${index + 1}`}
              placeholderTextColor={COLORS.text_light}
              value={inst}
              onChangeText={(t) => updateInstruction(t, index)}
              multiline
            />
            <TouchableOpacity onPress={() => removeInstruction(index)} style={styles.removeBtn}>
              <XCircle size={20} color={COLORS.text_light} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 50 }} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  photoContainer: {
    height: 200,
    backgroundColor: COLORS.background_light,
    borderRadius: RADII.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoText: {
    color: COLORS.text_light,
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text_dark,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    backgroundColor: COLORS.white,
    height: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: COLORS.primary_light,
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  tagTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dynamicInput: {
    flex: 1,
  },
  removeBtn: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  stepNum: {
    width: 24,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text_light,
  },
});

export default EditRecipeScreen;