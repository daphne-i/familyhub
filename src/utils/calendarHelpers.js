import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isSaturday,
  isSunday,
  subMonths,
} from 'date-fns';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
// Import Timestamp correctly
const Timestamp = firestore.Timestamp;

/**
 * Calculates the next due date based on an interval.
 * @param {Date} currentDate The original due date.
 * @param {string} interval The repeat interval (e.g., "Every day").
 * @return {Date} The new due date.
 */
function calculateNextDate(currentDate, interval) {
  const nextDate = new Date(currentDate.getTime());

  switch (interval) {
    case 'Every day':
      return addDays(nextDate, 1);
    case 'Every weekday':
      let newDay = addDays(nextDate, 1);
      if (isSaturday(newDay)) {
        newDay = addDays(newDay, 2); // Move to Monday
      } else if (isSunday(newDay)) {
        newDay = addDays(newDay, 1); // Move to Monday
      }
      return newDay;
    case 'Every week':
      return addWeeks(nextDate, 1);
    case 'Every two weeks':
      return addWeeks(nextDate, 2);
    case 'Every month':
      return addMonths(nextDate, 1);
    case 'Every year':
      return addYears(nextDate, 1);
    default:
      return addDays(nextDate, 1); // Default to daily
  }
}

/**
 * "Expands" a list of events into a list of all their occurrences
 * within a given date range.
 * @param {Array} events The original events from Firestore.
 * @param {Date} startDate The start of the view (e.g., 3 months ago).
 * @param {Date} endDate The end of the view (e.g., 6 months from now).
 * @returns {Array} A flat list of all event occurrences.
 */
export const expandRecurringEvents = (events, startDate, endDate) => {
  const allOccurrences = [];
  if (!events) return allOccurrences;

  events.forEach((event) => {
    // Ensure timestamps exist
    if (!event.startAt || !event.endAt) {
      return;
    }
    
    // 1. Get the original event's dates
    const originalStartDate = event.startAt.toDate();
    const originalEndDate = event.endAt.toDate();
    const duration = originalEndDate.getTime() - originalStartDate.getTime();
    
    // 2. Add the base event itself
    allOccurrences.push({
      ...event,
      id: `${event.id}-base`, // Unique ID for this occurrence
      originalId: event.id, // The REAL document ID
      occurrenceDate: originalStartDate,
    });

    // 3. If it repeats, calculate future occurrences
    const { repeat } = event;
    if (repeat && repeat !== 'One time only' && repeat !== 'Never') {
      let nextDate = calculateNextDate(originalStartDate, repeat);

      // Loop and add occurrences until we pass the end of our view
      while (nextDate < endDate) {
        // Only add occurrences that are *after* our view starts
        if (nextDate >= startDate) {
          const newEndDate = new Date(nextDate.getTime() + duration);
          
          allOccurrences.push({
            ...event, // Copy all original data
            id: `${event.id}-${nextDate.toISOString()}`, // Unique ID
            originalId: event.id, // The REAL document ID
            occurrenceDate: nextDate, // The new start date for this occurrence
            
            // Create new Firestore Timestamps for this occurrence
            startAt: Timestamp.fromDate(nextDate),
            endAt: Timestamp.fromDate(newEndDate),
          });
        }
        // Get the next date for the loop
        nextDate = calculateNextDate(nextDate, repeat);
      }
    }
  });

  return allOccurrences;
};