import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from './useFamily';
import { startOfDay, endOfDay, format } from 'date-fns';

export const useDashboard = () => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  
  const [data, setData] = useState({
    events: [],
    todaysMeals: [],
    budgetSummary: null,
    loading: true,
  });

  useEffect(() => {
    if (!user || !familyId) return;

    console.log(`Dashboard: Fetching for ${familyId}`);

    // Use standard JS Date objects (Firestore handles these automatically)
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const currentMonth = format(new Date(), 'yyyy-MM');

    // 1. Listen to Today's Events
    const eventsUnsub = firestore()
      .collection(`families/${familyId}/calendar_events`)
      .where('startTime', '>=', todayStart) // Passing Date object directly
      .where('startTime', '<=', todayEnd)
      .onSnapshot(
        snap => {
          const events = [];
          if (snap) {
            snap.forEach(doc => {
              const d = doc.data();
              // Safety check: Convert Timestamp to Date if needed
              const start = d.startTime?.toDate ? d.startTime.toDate() : new Date(d.startTime);
              events.push({ id: doc.id, ...d, startTime: start });
            });
          }
          events.sort((a, b) => a.startTime - b.startTime);
          console.log(`Dashboard: Found ${events.length} events.`);
          setData(prev => ({ ...prev, events }));
        }, 
        err => console.error("Events Error:", err)
      );

    // 2. Listen to Today's Meal Plan
    const mealsUnsub = firestore()
      .collection(`families/${familyId}/mealPlan`)
      .where('date', '>=', todayStart)
      .where('date', '<=', todayEnd)
      .onSnapshot(
        snap => {
          const meals = [];
          if (snap) {
            snap.forEach(doc => meals.push({ id: doc.id, ...doc.data() }));
          }
          console.log(`Dashboard: Found ${meals.length} meals.`);
          setData(prev => ({ ...prev, todaysMeals: meals }));
        },
        err => console.error("Meals Error:", err)
      );

    // 3. Listen to Current Month Budget
    const budgetUnsub = firestore()
      .collection(`families/${familyId}/budgets`)
      .doc(currentMonth)
      .onSnapshot(
        doc => {
          if (doc && doc.exists) {
            const b = doc.data() || {};
            const spent = b.totalSpent || 0;
            const limit = b.monthlyLimit || 0;
            
            setData(prev => ({ 
              ...prev, 
              budgetSummary: {
                spent: spent,
                limit: limit,
                remaining: limit - spent
              },
              loading: false
            }));
          } else {
            setData(prev => ({ ...prev, budgetSummary: null, loading: false }));
          }
        },
        err => {
          console.error("Budget Error:", err);
          setData(prev => ({ ...prev, loading: false }));
        }
      );

    return () => {
      eventsUnsub();
      mealsUnsub();
      budgetUnsub();
    };
  }, [user, familyId]);

  return data;
};