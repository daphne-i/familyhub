import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. The Base: Your Tabs
import MainAppTabs from './MainAppTabs';

// 2. The Features (Move these here so Dashboard can find them!)
import SettingsScreen from '../screens/Settings/SettingsScreen';

// Features from your old HubStack
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import NewEventScreen from '../screens/Calendar/NewEventScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import NewTransactionScreen from '../screens/Budget/NewTransactionScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import RecipeBoxScreen from '../screens/RecipeBox/RecipeBoxScreen';
import DishPickerScreen from '../screens/MealPlanner/DishPickerScreen';
import AddRecipeToMealPlannerScreen from '../screens/RecipeBox/AddRecipeToMealPlannerScreen';
import ListsScreen from '../screens/Lists/ListsScreen';
import ListDetailScreen from '../screens/Lists/ListDetailScreen';
import AddItemScreen from '../screens/Lists/AddItemScreen';
import ItemDetailScreen from '../screens/Lists/ItemDetailScreen';
import AddListScreen from '../screens/Lists/AddListScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* 🏠 The Foundation: Your Tabs (Dashboard + Hub) */}
      <Stack.Screen name="MainTabs" component={MainAppTabs} />

      {/* ⚙️ Shared Screens (Now accessible from EVERYWHERE) */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      
      {/* Calendar */}
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="NewEvent" component={NewEventScreen} options={{ presentation: 'modal' }} />
      
      {/* Budget */}
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="NewTransaction" component={NewTransactionScreen} options={{ presentation: 'modal' }} />
      
      {/* Food */}
      <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
      <Stack.Screen name="DishPicker" component={DishPickerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="RecipeBox" component={RecipeBoxScreen} />
      <Stack.Screen name="AddRecipeToMealPlanner" component={AddRecipeToMealPlannerScreen} options={{ presentation: 'modal' }} />

      {/* Lists */}
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="AddItem" component={AddItemScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="AddList" component={AddListScreen} options={{ presentation: 'modal' }} />

    </Stack.Navigator>
  );
};

export default MainStack;