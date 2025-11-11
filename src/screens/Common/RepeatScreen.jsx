import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const REPEAT_OPTIONS = [
  'One time only',
  'Every day',
  'Every weekday',
  'Every week',
  'Every two weeks',
  'Every month',
  'Every year',
];

const RepeatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentValue, onSave } = route.params;

  const renderItem = ({ item }) => {
    const isSelected = item === currentValue;
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          onSave(item);
          navigation.goBack();
        }}>
        <Text
          style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {item}
        </Text>
        {isSelected && <Check size={20} color={COLORS.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repeat</Text>
      </View>
      <FlatList
        data={REPEAT_OPTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  header: {
    flexDirection: 'row',
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
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
    marginLeft: SPACING.lg,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
  },
  itemTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default RepeatScreen;