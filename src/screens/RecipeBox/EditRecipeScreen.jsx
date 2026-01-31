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
  XCircle,
  ListPlus,
  ChevronDown 
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

import * as theme from '../../utils/theme';
import { addRecipe, updateRecipe, deleteRecipe } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_RECIPE_CATEGORIES } from '../../constants';
import UnitPickerModal from './UnitPickerModal'; 

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const EditRecipeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { familyId } = useFamily();
  const { user } = useAuth();
  
  // Destructure initial params
  const { mode, recipe } = route.params || {}; 

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(recipe?.title || '');
  const [description, setDescription] = useState(recipe?.description || '');
  const [cookTime, setCookTime] = useState(recipe?.cookTime || '');
  const [servings, setServings] = useState(recipe?.servings || '');
  const [photoUrl, setPhotoUrl] = useState(recipe?.photoUrl || null);
  
  // Initialize Ingredients safely
  const initialIngredients = (recipe?.ingredients || []).map(ing => {
    if (typeof ing === 'string') {
      return { name: ing, qty: '', unit: 'no' };
    }
    return ing;
  });

  const [ingredients, setIngredients] = useState(initialIngredients);
  const [instructions, setInstructions] = useState(recipe?.instructions || []);
  const [categoryIds, setCategoryIds] = useState(recipe?.categoryIds || []);

  // Unit Picker State
  const [isUnitPickerVisible, setUnitPickerVisible] = useState(false);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);

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

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', qty: '', unit: 'no' }]);
  };

  const updateIngredient = (index, field, value) => {
    const newArr = [...ingredients];
    newArr[index] = { ...newArr[index], [field]: value };
    setIngredients(newArr);
  };

  const removeIngredient = (index) => {
    const newArr = ingredients.filter((_, i) => i !== index);
    setIngredients(newArr);
  };

  const openUnitPicker = (index) => {
    setActiveIngredientIndex(index);
    setUnitPickerVisible(true);
  };

  const handleUnitSelect = (unit) => {
    if (activeIngredientIndex !== null) {
      updateIngredient(activeIngredientIndex, 'unit', unit);
    }
  };

  // --- THE FIX: Pass a callback function ---
  const handleEditInstructions = () => {
    navigation.navigate('EditInstructions', { 
      currentInstructions: instructions,
      // Pass this function to the next screen
      onSave: (newInstructions) => {
        setInstructions(newInstructions);
      }
    });
  };

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
      const cleanIngredients = ingredients.filter(i => i.name.trim() !== '');
      
      const recipeData = {
        title,
        description,
        cookTime,
        servings,
        photoUrl,
        ingredients: cleanIngredients,
        instructions,
        categoryIds,
        updatedBy: user.uid,
        titleLower: title.toLowerCase(),
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
            <TextInput style={styles.input} placeholder="30m" value={cookTime} onChangeText={setCookTime} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Servings</Text>
            <TextInput style={styles.input} placeholder="4" value={servings} onChangeText={setServings} />
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
          <View key={index} style={styles.ingredientRow}>
            <TextInput
              style={[styles.input, styles.qtyInput]}
              placeholder="1"
              placeholderTextColor={COLORS.text_light}
              value={ing.qty}
              onChangeText={(t) => updateIngredient(index, 'qty', t)}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={styles.unitButton} 
              onPress={() => openUnitPicker(index)}>
              <Text style={styles.unitText}>{ing.unit || 'no'}</Text>
              <ChevronDown size={14} color={COLORS.text_light} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Ingredient name"
              placeholderTextColor={COLORS.text_light}
              value={ing.name}
              onChangeText={(t) => updateIngredient(index, 'name', t)}
            />
            <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.removeBtn}>
              <XCircle size={20} color={COLORS.text_light} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addItemButton} onPress={addIngredient}>
            <ListPlus size={18} color={COLORS.text_light} style={{marginRight: 8}} />
            <Text style={styles.addItemText}>Add ingredient</Text>
        </TouchableOpacity>

        {/* Instructions */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Instructions</Text>
        <View style={styles.instructionsList}>
            {instructions.map((inst, index) => (
                <View key={index} style={styles.instructionItem}>
                    <Text style={styles.stepNum}>{index + 1}.</Text>
                    <Text style={styles.instructionText}>{inst}</Text>
                </View>
            ))}
        </View>

        <TouchableOpacity style={styles.addItemButton} onPress={handleEditInstructions}>
            <ListPlus size={18} color={COLORS.text_light} style={{marginRight: 8}} />
            <Text style={styles.addItemText}>
                {instructions.length > 0 ? 'Edit instructions' : 'Add instructions'}
            </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
      
      <UnitPickerModal
        visible={isUnitPickerVisible}
        onClose={() => setUnitPickerVisible(false)}
        onSelect={handleUnitSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background_white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  iconButton: { padding: SPACING.xs },
  content: { padding: SPACING.lg },
  photoContainer: { height: 200, backgroundColor: COLORS.background_light, borderRadius: RADII.lg, marginBottom: SPACING.lg, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { alignItems: 'center' },
  photoText: { color: COLORS.text_light, marginTop: SPACING.sm, fontSize: FONT_SIZES.sm },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text_dark, marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.md, color: COLORS.text_dark, height: 40 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, marginBottom: 8 },
  tagSelected: { backgroundColor: COLORS.primary_light, borderColor: COLORS.primary },
  tagText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  tagTextSelected: { color: COLORS.primary, fontWeight: '600' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, color: COLORS.text_light },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  qtyInput: { width: 50, textAlign: 'center', marginRight: SPACING.sm },
  unitButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background_light, paddingHorizontal: SPACING.sm, paddingVertical: 8, borderRadius: RADII.sm, marginRight: SPACING.sm, minWidth: 60, justifyContent: 'space-between' },
  unitText: { fontSize: FONT_SIZES.sm, color: COLORS.text_dark, marginRight: 4 },
  nameInput: { flex: 1 },
  removeBtn: { padding: SPACING.sm, marginLeft: SPACING.xs },
  addItemButton: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, paddingVertical: SPACING.sm },
  addItemText: { fontSize: FONT_SIZES.md, color: COLORS.text_dark, fontWeight: '500' },
  instructionsList: { marginTop: SPACING.sm },
  instructionItem: { flexDirection: 'row', marginBottom: SPACING.sm },
  stepNum: { width: 20, fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text_light, marginRight: SPACING.sm },
  instructionText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text_dark },
});

export default EditRecipeScreen;