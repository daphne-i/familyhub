import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Plus,
  Heart,
  Clock,
  Utensils,
  Link as LinkIcon,
  X
} from 'lucide-react-native';
import functions from '@react-native-firebase/functions'; // <-- Added Functions Import
import * as theme from '../../utils/theme';
import { useFamilyCollection } from '../../services/firestore';
import { DEFAULT_RECIPE_CATEGORIES } from '../../constants';
import AddRecipeOptionsModal from './AddRecipeOptionsModal';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const RecipeHeader = ({ onSearch, searchValue }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipes</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical size={24} color={COLORS.text_dark} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.text_light} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={COLORS.text_light}
          value={searchValue}
          onChangeText={onSearch}
        />
      </View>
    </View>
  );
};

const FilterPills = ({ selectedFilter, onSelect }) => {
  const filters = [
    { id: 'all', name: 'All', icon: Utensils },
    { id: 'recent', name: 'Most Recent', icon: Clock },
    ...DEFAULT_RECIPE_CATEGORIES
  ];

  return (
    <FlatList
      horizontal
      data={filters}
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterList}
      renderItem={({ item }) => {
        const isSelected = selectedFilter === item.id;
        const IconComponent = typeof item.icon === 'string' ? null : item.icon;
        
        return (
          <TouchableOpacity
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelect(item.id)}
          >
            {IconComponent ? (
              <IconComponent 
                size={16} 
                color={isSelected ? COLORS.white : COLORS.text_dark} 
                style={styles.pillIcon} 
              />
            ) : (
              <Text style={styles.pillEmoji}>{item.icon}</Text>
            )}
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const RecipeCard = ({ recipe, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {recipe.photoUrl ? (
        <Image source={{ uri: recipe.photoUrl }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]}>
          <Utensils size={40} color={COLORS.white} />
        </View>
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
        <View style={styles.cardMetaRow}>
          {recipe.cookTime ? (
            <View style={styles.metaItem}>
              <Clock size={12} color={COLORS.text_light} />
              <Text style={styles.metaText}>{recipe.cookTime}</Text>
            </View>
          ) : null}
        </View>
      </View>
      
      {recipe.isFavorite && (
        <View style={styles.favBadge}>
          <Heart size={12} color={COLORS.white} fill={COLORS.white} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- NEW URL Import Modal ---
const URLImportModal = ({ visible, onClose, onExtract, extracting }) => {
  const [url, setUrl] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import Recipe</Text>
            <TouchableOpacity onPress={onClose} disabled={extracting}>
              <X size={24} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>
           <Text style={styles.modalSubtitle}>Paste a website link to instantly extract the ingredients and steps.</Text>
           
           <View style={styles.urlInputContainer}>
             <LinkIcon size={20} color={COLORS.text_light} style={{marginRight: 10}} />
             <TextInput
               style={styles.urlInput}
               value={url}
               onChangeText={setUrl}
               placeholder="https://www.foodnetwork.com/..."
               placeholderTextColor={COLORS.text_light}
               autoCapitalize="none"
               autoCorrect={false}
               editable={!extracting}
             />
           </View>

           <TouchableOpacity 
             onPress={() => {
               if(url) onExtract(url);
             }} 
             style={[styles.saveButton, !url && { opacity: 0.5 }]}
             disabled={!url || extracting}
           >
             {extracting ? (
               <ActivityIndicator color={COLORS.white} />
             ) : (
               <Text style={styles.saveButtonText}>Extract Recipe</Text>
             )}
           </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Main Screen ---

const RecipeBoxScreen = () => {
  const navigation = useNavigation();
  const { data: recipes, loading } = useFamilyCollection('recipes');
  
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modals state
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isUrlModalVisible, setUrlModalVisible] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Filter Logic
  const filteredRecipes = useMemo(() => {
    let result = recipes || [];

    if (searchText) {
      result = result.filter(r => 
        r.title?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (activeFilter !== 'all') {
      if (activeFilter === 'recent') {
        result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      } else if (activeFilter === 'favorites') {
        result = result.filter(r => r.isFavorite);
      } else {
        result = result.filter(r => r.categoryIds?.includes(activeFilter));
      }
    }

    return result;
  }, [recipes, searchText, activeFilter]);

  const handleManualCreate = () => {
    setAddModalVisible(false);
    navigation.navigate('EditRecipe', { mode: 'create' });
  };

  const handleWebCreate = () => {
    setAddModalVisible(false);
    // Open the URL prompt instead of going directly to EditRecipe
    setTimeout(() => setUrlModalVisible(true), 300); 
  };

  const handleExtractRecipe = async (url) => {
    try {
      setIsExtracting(true);
      
      // Call your Firebase Cloud Function!
      const result = await functions().httpsCallable('extractRecipe')({ url });
      const scrapedData = result.data;

      setIsExtracting(false);
      setUrlModalVisible(false);

      // Pass the extracted data to the EditRecipe screen so you can review it before saving!
      navigation.navigate('EditRecipe', { mode: 'create', isWeb: true, scrapedData });
      
    } catch (error) {
      setIsExtracting(false);
      console.error(error);
      Alert.alert(
        "Extraction Failed", 
        "Could not automatically read this website. Please try adding it manually, or try a different site."
      );
    }
  };

  return (
    <View style={styles.container}>
      <RecipeHeader onSearch={setSearchText} searchValue={searchText} />
      
      <View style={styles.filterContainer}>
        <FilterPills selectedFilter={activeFilter} onSelect={setActiveFilter} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <RecipeCard 
              recipe={item} 
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id, recipe: item })} 
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No recipes found.</Text>
              <Text style={styles.emptySubtext}>Time to cook something up!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>

      <AddRecipeOptionsModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSelectManual={handleManualCreate}
        onSelectWeb={handleWebCreate}
      />

      <URLImportModal
        visible={isUrlModalVisible}
        onClose={() => setUrlModalVisible(false)}
        onExtract={handleExtractRecipe}
        extracting={isExtracting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background_white },
  header: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text_dark },
  iconButton: { padding: SPACING.xs },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background_light, borderRadius: RADII.md, paddingHorizontal: SPACING.md, height: 44 },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text_dark },
  filterContainer: { backgroundColor: COLORS.white, paddingBottom: SPACING.md },
  filterList: { paddingHorizontal: SPACING.lg },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background_light, marginRight: SPACING.sm, borderWidth: 1, borderColor: 'transparent' },
  pillSelected: { backgroundColor: COLORS.primary },
  pillIcon: { marginRight: 6 },
  pillEmoji: { marginRight: 6, fontSize: 14 },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text_dark },
  pillTextSelected: { color: COLORS.white },
  listContent: { padding: SPACING.lg },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADII.md, marginBottom: SPACING.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, height: 80 },
  cardImage: { width: 80, height: 80 },
  cardPlaceholder: { backgroundColor: COLORS.orange_light, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  recipeTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text_dark, marginBottom: SPACING.xs },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md },
  metaText: { fontSize: FONT_SIZES.sm, color: COLORS.text_light, marginLeft: 4 },
  favBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark, marginTop: SPACING.md },
  emptySubtext: { fontSize: FONT_SIZES.md, color: COLORS.text_light },
  fab: { position: 'absolute', bottom: SPACING.xl, right: SPACING.xl, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  
  // NEW Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg },
  modalContainer: { backgroundColor: COLORS.white, borderRadius: RADII.lg, padding: SPACING.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text_dark },
  modalSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.text_light, marginBottom: SPACING.lg },
  urlInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.xl },
  urlInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md },
  saveButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADII.md, alignItems: 'center' },
  saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: FONT_SIZES.md },
});

export default RecipeBoxScreen;