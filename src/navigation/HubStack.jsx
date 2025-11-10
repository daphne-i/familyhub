import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HubScreen from '../screens/Hub/HubScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

// Import all the feature screens
import ListsScreen from '../screens/Lists/ListsScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import DocumentsScreen from '../screens/Documents/DocumentsScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import RecipeBoxScreen from '../screens/RecipeBox/RecipeBoxScreen';

// --- ADD THE NEW LISTS SCREENS ---
import ListDetailScreen from '../screens/Lists/ListDetailScreen';
import AddItemScreen from '../screens/Lists/AddItemScreen';
import ItemDetailScreen from '../screens/Lists/ItemDetailScreen';

const Stack = createNativeStackNavigator();

const HubStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Hub" component={HubScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      
      {/* Feature Home Screens */}
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
      <Stack.Screen name="RecipeBox" component={RecipeBoxScreen} />

      {/* --- ADD THE NEW LISTS SCREENS --- */}
      {/* These are pushed from ListsScreen or ListDetailScreen */}
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ presentation: 'modal' }} // Opens as a modal (as per doc 6.1)
      />
    </Stack.Navigator>
  );
};

export default HubStack;