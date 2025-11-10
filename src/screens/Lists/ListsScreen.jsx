import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection } from '../../services/firestore';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;
const { width } = Dimensions.get('window');
const cardSize = (width - SPACING.lg * 3) / 2;

// --- Components ---

const ListHeader = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Lists</Text>
      <TouchableOpacity style={styles.headerButton}>
        <MoreHorizontal size={FONT_SIZES.xl} color={COLORS.text_dark} />
      </TouchableOpacity>
    </View>
  );
};

const ListCard = ({ list, onPress }) => {
  const cardColor =
    list.type === 'shopping' ? COLORS.primary_light : COLORS.green_light;
  const cardIcon = list.type === 'shopping' ? '🛍️' : '📋';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor }]}
      onPress={onPress}>
      <Text style={styles.cardTitle}>{list.name}</Text>
      <Text style={styles.cardSubtitle}>{list.itemCount || 0} items</Text>
      <Text style={styles.cardIcon}>{cardIcon}</Text>
    </TouchableOpacity>
  );
};

// --- Main Screen ---

const ListsScreen = () => {
  const navigation = useNavigation();
  const { data: lists, loading, error } = useFamilyCollection('lists');

  // Sort the data so it's stable
  const sortedLists = useMemo(() => {
    return lists.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.toDate() - b.createdAt.toDate();
    });
  }, [lists]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading lists.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={sortedLists}
        renderItem={({ item }) => (
          <ListCard
            list={item}
            onPress={() =>
              navigation.push('ListDetail', {
                listId: item.id,
                listName: item.name,
                listType: item.type,
              })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No lists created yet.</Text>
            <Text style={styles.emptyText}>Tap the + to add one!</Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ListHeader />
      {renderContent()}
      {/* === FAB === */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddList')}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  // --- List ---
  listContent: {
    padding: SPACING.lg,
  },
  card: {
    width: cardSize,
    height: cardSize,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    margin: SPACING.sm / 2,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  cardIcon: {
    fontSize: 40,
    alignSelf: 'flex-end',
  },
  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // --- Loading/Error States ---
  centered: {
    flex: 1,
    height: width, // Make it take up significant space
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_danger,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    textAlign: 'center',
  },
});

export default ListsScreen;