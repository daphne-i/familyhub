import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Agenda } from 'react-native-calendars';
import {
  ArrowLeft,
  ChevronDown,
  Users,
  Plus,
  ArrowRight,
  ArrowLeft as ArrowLeftCal,
} from 'lucide-react-native';
import * as theme from '../../utils/theme';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Mock Data (from screenshot) ---
const MOCK_EVENTS = {
  '2025-11-08': [
    { name: 'Yyy', time: '2:00 - 3:00' },
    { name: 'Apples', time: '2:04' },
  ],
  '2025-01-01': [{ name: "New Year's Day", time: 'All day' }],
  '2025-04-18': [{ name: 'Good Friday', time: 'All day' }],
  '2025-04-21': [{ name: 'Easter Monday', time: 'All day' }],
  '2025-12-25': [{ name: 'Christmas Day', time: 'All day' }],
  '2025-12-26': [{ name: 'Boxing Day', time: 'All day' }],
};

// --- Components ---

const CalendarHeader = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentView, setCurrentView] = useState('List');

  // TODO: Add modal logic for view picker
  const [isPickerVisible, setPickerVisible] = useState(false);

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.goBack()}>
        <ArrowLeft size={FONT_SIZES.xl} color={COLORS.white} />
      </TouchableOpacity>
      
      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.headerButton}>
          <ArrowLeftCal size={FONT_SIZES.xl} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <ArrowRight size={FONT_SIZES.xl} color={COLORS.white} />
        </TouchableOpacity>

        {/* View Picker */}
        <TouchableOpacity
          style={styles.viewPicker}
          onPress={() => setPickerVisible(true)}>
          <Text style={styles.viewPickerText}>{currentView}</Text>
          <ChevronDown size={FONT_SIZES.md} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.membersButton}>
        <Users size={20} color={COLORS.text_dark} />
        <Text style={styles.membersButtonText}>Members</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Screen ---

const CalendarScreen = () => {
  const navigation = useNavigation();
  
  const renderItem = (item) => {
    return (
      <Pressable style={styles.itemContainer}>
        <View>
          <Text style={styles.itemTime}>{item.time}</Text>
          <Text style={styles.itemText}>{item.name}</Text>
        </View>
      </Pressable>
    );
  };

  const renderEmptyDate = () => {
    return <View style={styles.emptyDate} />;
  };

  return (
    <View style={styles.container}>
      <CalendarHeader />
      
      {/* We are implementing the "List" view (Agenda) */}
      <Agenda
        items={MOCK_EVENTS}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        rowHasChanged={(r1, r2) => r1.name !== r2.name}
        theme={{
          backgroundColor: COLORS.background_dark,
          calendarBackground: COLORS.background_dark_secondary,
          agendaKnobColor: COLORS.primary,
          monthTextColor: COLORS.white,
          dayTextColor: COLORS.white,
          textDisabledColor: COLORS.text_light,
          todayTextColor: COLORS.primary,
          dotColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
        }}
      />

      {/* === FAB === */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewEvent')}>
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_dark,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background_dark_secondary,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  headerControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: SPACING.lg,
  },
  viewPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    marginLeft: SPACING.lg,
  },
  viewPickerText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  membersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.full,
  },
  membersButtonText: {
    color: COLORS.text_dark,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  // --- Agenda List ---
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginRight: SPACING.lg,
    marginTop: SPACING.lg,
  },
  itemTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text_light,
  },
  itemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_dark,
    fontWeight: '600',
  },
  emptyDate: {
    height: 15,
    flex: 1,
    marginTop: 30,
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
  },
});

export default CalendarScreen;