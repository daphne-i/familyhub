import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { addFamilyDoc } from '../../services/firestore';
import { useFamily } from '../../hooks/useFamily';
import firestore from '@react-native-firebase/firestore'; // Import firestore for timestamp

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

const AddListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { familyId } = useFamily();

  const [name, setName] = useState('');
  const [type, setType] = useState('shopping'); // 'shopping' or 'todo'
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Missing Name', 'Please enter a name for your list.');
      return;
    }
    setLoading(true);

    const newList = {
      name: name,
      type: type,
      itemCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      // Use our new generic function
      await addFamilyDoc(familyId, `lists`, newList);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not create list. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* === Header === */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <X size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New List</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Check size={FONT_SIZES.xl} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* === Form === */}
      <View style={styles.form}>
        <TextInput
          placeholder="List Name (e.g., Shopping)"
          placeholderTextColor={COLORS.text_light}
          value={name}
          onChangeText={setName}
          style={styles.textInput}
          autoFocus={true}
        />
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'shopping' && styles.typeButtonActive,
            ]}
            onPress={() => setType('shopping')}>
            <Text
              style={[
                styles.typeButtonText,
                type === 'shopping' && styles.typeButtonTextActive,
              ]}>
              🛍️ Shopping
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'todo' && styles.typeButtonActive,
            ]}
            onPress={() => setType('todo')}>
            <Text
              style={[
                styles.typeButtonText,
                type === 'todo' && styles.typeButtonTextActive,
              ]}>
              📋 To Do
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_modal,
  },
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
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  form: {
    padding: SPACING.lg,
  },
  textInput: {
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
  },
  typeButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary_light,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default AddListScreen;