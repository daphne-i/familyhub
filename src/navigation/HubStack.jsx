import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HubScreen from '../screens/Hub/HubScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ListsScreen from '../screens/Lists/ListsScreen';
import ListDetailScreen from '../screens/Lists/ListDetailScreen';
import AddItemScreen from '../screens/Lists/AddItemScreen';
import ItemDetailScreen from '../screens/Lists/ItemDetailScreen';
import AddListScreen from '../screens/Lists/AddListScreen'; // 1. Import (note: filename has typo AddLIist)
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import NewEventScreen from '../screens/Calendar/NewEventScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import DocumentsScreen from '../screens/Documents/DocumentsScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import RecipeBoxScreen from '../screens/RecipeBox/RecipeBoxScreen';

const Stack = createNativeStackNavigator();

const HubStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* --- Main Hub --- */}
      <Stack.Screen name="Hub" component={HubScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* --- Lists Feature (Section 6.1) --- */}
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      {/* 2. Add the new screen */}
      <Stack.Screen
        name="AddList"
        component={AddListScreen}
        options={{ presentation: 'modal' }}
      />

      {/* --- Calendar Feature (Section 6.2) --- */}
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen
        name="NewEvent"
        component={NewEventScreen}
        options={{ presentation: 'modal' }}
      />

      {/* --- Other Feature Placeholders --- */}
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
      <Stack.Screen name="RecipeBox" component={RecipeBoxScreen} />
    </Stack.Navigator>
  );
};

export default HubStack;