import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
// 1. IMPORT CALENDARLIST INSTEAD OF CALENDAR
import { CalendarList } from 'react-native-calendars';
import { Home, Plus } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import { useFamilyCollection } from '../../services/firestore';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---
// ... (EventItem component is unchanged) ...
const EventItem = ({ event }) => {
  const timeString = event.allDay
    ? 'All day'
    : `${event.startAt.toDate().toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })} - ${event.endAt.toDate().toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
  return (
    <Pressable style={[styles.itemCard, styles.eventCard]}>
      <View style={styles.itemTimeContainer}>
        <Text style={styles.itemTime}>{timeString}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{event.title}</Text>
      </View>
    </Pressable>
  );
};

// --- Helper Functions ---
// ... (toDateString and generateDateRange are unchanged) ...
const toDateString = (date) => {
  return date.toISOString().split('T')[0];
};
const generateDateRange = (startDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(12, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// --- Main Screen ---
const CalendarScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { data: events, loading } = useFamilyCollection('calendar');
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );

  // ... (upcomingDays and groupedEvents useMemo hooks are unchanged) ...
  const upcomingDays = useMemo(() => {
    return generateDateRange(selectedDate);
  }, [selectedDate]);

  const { markedDates, groupedEvents } = useMemo(() => {
    const marks = {};
    const groups = {};

    if (events) {
      events.forEach(event => {
        if (!event.startAt) return;
        const dateStr = toDateString(event.startAt.toDate());
        marks[dateStr] = { marked: true, dotColor: COLORS.orange };
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push({ type: 'event', data: event });
      });
    }

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.white,
      };
    }

    return { markedDates: marks, groupedEvents: groups };
  }, [events, selectedDate]);


  return (
    <View style={styles.container}>
      {/* --- Simplified Header --- */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Dashboard')}>
          <Home size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{currentMonth}</Text>
        
        <View style={styles.headerButton} /> 
      </View>
      
      {/* --- 2. USE CALENDARLIST INSTEAD OF CALENDAR --- */}
      <CalendarList
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        
        // 3. Use onVisibleMonthsChange to update the header
        onVisibleMonthsChange={(months) => {
          if (months.length > 0) {
            setCurrentMonth(new Date(months[0].dateString).toLocaleString('default', { 
              month: 'long', 
              year: 'numeric' 
            }));
          }
        }}
        
        markedDates={markedDates}
        
        // 4. Set to horizontal and enable paging for smooth scroll
        horizontal={true}
        pagingEnabled={true}
        
        // 5. Remove enableSwipeMonths (it's default for CalendarList)
        
        theme={{
          backgroundColor: COLORS.background_white,
          calendarBackground: COLORS.white,
          monthTextColor: COLORS.text_dark,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.border,
          todayTextColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.white,
          arrowColor: COLORS.primary,
          textMonthFontWeight: 'bold',
          textMonthFontSize: FONT_SIZES.lg,
          'stylesheet.calendar.header': {
            week: {
              marginTop: SPACING.sm,
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
            dayHeader: {
              color: COLORS.text_light,
              fontWeight: '600',
              fontSize: FONT_SIZES.sm,
            },
          },
        }}
      />
      
      {/* --- Agenda ScrollView --- */}
      <ScrollView style={styles.eventsList}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : (
          upcomingDays.map((day) => {
// ... (rest of the file is unchanged) ...
            const dateString = toDateString(day);
            const itemsForThisDay = groupedEvents[dateString] || [];
            
            return (
              <View key={dateString}>
                <Text style={styles.dateHeader}>
                  {day.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                
                {itemsForThisDay.length > 0 ? (
                  itemsForThisDay.map((item, index) => {
                    if (item.type === 'event') {
                      return <EventItem key={`evt-${index}`} event={item.data} />;
                    }
                    return null; 
                  })
                ) : (
                  <Text style={styles.noEventsText}>Nothing planned</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

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
// ... (styles are unchanged) ...
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.sm,
    width: 50, // Set fixed width for spacing
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text_dark,
  },
  eventsList: {
    flex: 1,
    backgroundColor: COLORS.background_light,
  },
  dateHeader: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text_dark,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  noEventsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text_light,
    textAlign: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderRadius: RADII.lg,
    overflow: 'hidden',
  },
  eventCard: {
    backgroundColor: COLORS.orange,
  },
  itemTimeContainer: {
    padding: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTime: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  itemContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  itemTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
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