import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CalendarList } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Home, Plus, CheckSquare, Square } from 'lucide-react-native';
import * as theme from '../../utils/theme';
import firestore from '@react-native-firebase/firestore'; // Import Firestore directly
import { 
  updateListItem, 
} from '../../services/firestore';
import { expandRecurringEvents } from '../../utils/calendarHelpers';
import { addYears, subMonths, startOfDay, format } from 'date-fns';
import MemberAvatar from '../Common/MemberAvatar';
import { useFamily } from '../../hooks/useFamily';

const { COLORS, FONT_SIZES, SPACING, RADII } = theme;

// --- Components ---

const EventItem = ({ event, onPress, onLongPress }) => {
  // Safety check for timestamps
  const start = event.startAt?.toDate ? event.startAt.toDate() : new Date(event.startAt || Date.now());
  const end = event.endAt?.toDate ? event.endAt.toDate() : new Date(event.endAt || Date.now());

  const timeString = event.allDay
    ? 'All day'
    : `${start.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })} - ${end.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
  
  const eventColor = event.color || COLORS.orange;

  return (
    <Pressable
      style={[styles.itemCard, { backgroundColor: eventColor }]}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View style={styles.itemTimeContainer}>
        <Text style={styles.itemTime}>{timeString}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{event.title}</Text>
      </View>
    </Pressable>
  );
};

const TaskItem = ({ item, onPress, onToggleComplete }) => {
  const itemDueDate = item.dueDate?.toDate ? item.dueDate.toDate() : (item.dueDate ? new Date(item.dueDate) : null);
  const timeString = itemDueDate
    ? itemDueDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'All day';

  return (
    <Pressable style={[styles.itemCard, styles.taskCard]} onPress={onPress}>
      <View style={[styles.itemTimeContainer, styles.taskTimeContainer]}>
        <Text style={styles.taskTime}>{timeString}</Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.taskMainRow}>
          <TouchableOpacity onPress={onToggleComplete} style={styles.taskCheckbox}>
            {item.completed ? (
              <CheckSquare size={20} color={COLORS.text_dark} />
            ) : (
              <Square size={20} color={COLORS.text_dark} />
            )}
          </TouchableOpacity>
          <Text style={styles.taskTitle}>{item.name}</Text>
        </View>
        {item.assigneeId && (
          <View style={styles.taskAssigneeRow}>
            <MemberAvatar memberId={item.assigneeId} />
          </View>
        )}
      </View>
    </Pressable>
  );
};

// --- Helper Functions ---
const toDateString = (date) => {
  if (!date) return '';
  // Ensure we have a valid Date object
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const generateDateRange = (startDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  // Avoid timezone issues by setting to noon
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
  const { familyId } = useFamily();
  
  // Local State for Data
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. DIRECT DATA FETCHING (The Fix) ---
  useEffect(() => {
    if (!familyId) return;

    setLoading(true);

    // A. Fetch Events (Directly from family collection)
    const eventsUnsub = firestore()
      .collection(`families/${familyId}/calendar_events`)
      .onSnapshot(snap => {
        const loadedEvents = [];
        snap.forEach(doc => {
            // Include ID and safe data
            loadedEvents.push({ id: doc.id, ...doc.data(), originalId: doc.id });
        });
        setEvents(loadedEvents);
      }, err => console.log("Calendar Events Error:", err));

    // B. Fetch Lists (For names)
    const listsUnsub = firestore()
      .collection(`families/${familyId}/lists`)
      .onSnapshot(snap => {
        const loadedLists = [];
        snap.forEach(doc => loadedLists.push({ id: doc.id, ...doc.data() }));
        setLists(loadedLists);
      }, err => console.log("Lists Error:", err));

    // C. Fetch Tasks (Safely)
    // We use a try/catch block around the listener setup in case permissions fail
    let tasksUnsub = () => {};
    try {
        tasksUnsub = firestore()
          .collectionGroup('items')
          .where('familyId', '==', familyId) // Ensure your items have familyId
          // .where('dueDate', '>', ...) // Removed complex filters to prevent index errors
          .onSnapshot(snap => {
            const loadedTasks = [];
            snap.forEach(doc => {
                const data = doc.data();
                if (data.dueDate) { // Only tasks with dates
                    loadedTasks.push({ id: doc.id, ...data });
                }
            });
            setTasks(loadedTasks);
          }, err => {
              console.log("Task Fetch Error (likely missing index):", err.message);
              // Don't crash, just show no tasks
          });
    } catch (e) {
        console.log("Task Query Setup Failed:", e);
    }

    setLoading(false);

    return () => {
        eventsUnsub();
        listsUnsub();
        tasksUnsub();
    };
  }, [familyId]);
  
  // Maps for List Info
  const listNameMap = useMemo(() => {
    return new Map(lists.map(list => [list.id, list.name]));
  }, [lists]);
  const listTypeMap = useMemo(() => {
    return new Map(lists.map(list => [list.id, list.type]));
  }, [lists]);


  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  
  const calendarListRef = useRef(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const upcomingDays = useMemo(() => {
    return generateDateRange(selectedDate);
  }, [selectedDate]);

  // --- COMBINE Events and Tasks ---
  const { markedDates, groupedItems } = useMemo(() => {
    const marks = {};
    const groups = {};
    
    // --- Process Events ---
    if (events.length > 0) {
      const now = new Date();
      const viewStartDate = subMonths(now, 3);
      const viewEndDate = addYears(now, 10);
      
      const allOccurrences = expandRecurringEvents(
        events,
        viewStartDate,
        viewEndDate
      );
      
      allOccurrences.forEach((occurrence) => {
        const dateStr = toDateString(occurrence.occurrenceDate);
        if (!dateStr) return; // Skip invalid dates

        const color = occurrence.color || COLORS.orange;
        
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push({ type: 'event', data: occurrence });

        if (!marks[dateStr]) {
          marks[dateStr] = { dots: [{ color: color }] };
        } else if (!marks[dateStr].dots) {
           marks[dateStr].dots = [{ color: color }];
        } else {
          if (!marks[dateStr].dots.find(d => d.color === color)) {
            marks[dateStr].dots.push({ color: color });
          }
        }
      });
    }
    
    // --- Process Tasks ---
    if (tasks.length > 0) {
      tasks.forEach((task) => {
        if (!task.dueDate) return;
        const taskDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        const dateStr = toDateString(taskDate);
        if (!dateStr) return;

        const color = COLORS.green;
        
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push({ type: 'task', data: task });
        
        if (!marks[dateStr]) {
          marks[dateStr] = { dots: [{ color: color }] };
        } else if (!marks[dateStr].dots) {
           marks[dateStr].dots = [{ color: color }];
        } else {
          if (!marks[dateStr].dots.find(d => d.color === color)) {
            marks[dateStr].dots.push({ color: color });
          }
        }
      });
    }

    // --- Set Selected Day ---
    if (selectedDate) {
      const currentMark = marks[selectedDate] || {};
      marks[selectedDate] = {
        ...currentMark,
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: COLORS.white,
        dots: currentMark.dots || [],
      };
    }

    return { markedDates: marks, groupedItems: groups };
  }, [events, tasks, selectedDate]);
  
  const markingType = 'multi-dot';

  // --- Handlers ---
  const handleViewEvent = (event) => {
    Alert.alert(
      event.title,
      `${event.description || ''}\n\nLocation: ${event.location || 'Not set'}`
    );
  };

  const handleEditEvent = (event) => {
    navigation.navigate('NewEvent', { eventId: event.originalId });
  };
  
  const handleEditTask = (task) => {
    if (!task.listId) {
      Alert.alert('Error', 'Cannot find the list for this task.');
      return;
    }
    
    const listName = listNameMap.get(task.listId) || 'List';
    const listType = listTypeMap.get(task.listId) || 'todo';

    navigation.push('ItemDetail', {
      itemId: task.id,
      listId: task.listId,
      listName: listName,
      listType: listType,
    });
  };
  
  const handleToggleTask = (task) => {
    if (!task.listId) return;
    updateListItem(familyId, task.listId, task.id, {
      completed: !task.completed,
    });
  };

  const handleMonthJump = (event, newDate) => {
    if (Platform.OS === 'android') {
      setShowMonthPicker(false);
    }
    
    if (event.type === 'set' && newDate) {
      const newDateStr = toDateString(newDate);
      calendarListRef.current?.scrollToMonth(newDateStr);
      setSelectedDate(newDateStr);
      setCurrentMonth(newDate.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
      }));
    }
  };

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Dashboard')}>
          <Home size={FONT_SIZES.xl} color={COLORS.text_dark} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
          <Text style={styles.headerTitle}>{currentMonth}</Text>
        </TouchableOpacity>
        
        <View style={styles.headerButton} /> 
      </View>
      
      {/* --- Calendar Component --- */}
      <CalendarList
        ref={calendarListRef}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        onVisibleMonthsChange={(months) => {
          if (months.length > 0) {
            setCurrentMonth(
              new Date(months[0].dateString).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })
            );
          }
        }}
        markedDates={markedDates}
        markingType={markingType}
        horizontal={true}
        pagingEnabled={true}
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
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SPACING.xl }}
          />
        ) : (
          upcomingDays.map((day) => {
            const dateString = toDateString(day);
            const itemsForThisDay = groupedItems[dateString] || [];

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
                  itemsForThisDay.map((item) => {
                    if (item.type === 'event') {
                      return (
                        <EventItem
                          key={item.data.id + Math.random()} // Ensure unique keys
                          event={item.data}
                          onPress={() => handleViewEvent(item.data)}
                          onLongPress={() => handleEditEvent(item.data)}
                        />
                      );
                    }
                    if (item.type === 'task') {
                      return (
                        <TaskItem
                          key={item.data.id}
                          item={item.data}
                          onPress={() => handleEditTask(item.data)}
                          onToggleComplete={() => handleToggleTask(item.data)}
                        />
                      );
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
      
      {showMonthPicker && (
        <DateTimePicker
          value={new Date(selectedDate)}
          mode="date"
          display="default"
          onChange={handleMonthJump}
          onClose={() => setShowMonthPicker(false)}
        />
      )}
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.sm,
    width: 50,
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
  taskCard: {
    backgroundColor: COLORS.green_light,
  },
  itemTimeContainer: {
    padding: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 75,
  },
  taskTimeContainer: {
    borderRightColor: 'rgba(16, 185, 129, 0.3)', 
  },
  itemTime: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  taskTime: {
    color: COLORS.green,
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
  taskMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    paddingRight: SPACING.sm,
  },
  taskTitle: {
    color: COLORS.text_dark,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  taskAssigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingLeft: SPACING.md, 
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