import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Screen Imports ---
import HubScreen from '../screens/Hub/HubScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

// Lists
import ListsScreen from '../screens/Lists/ListsScreen';
import ListDetailScreen from '../screens/Lists/ListDetailScreen';
import AddItemScreen from '../screens/Lists/AddItemScreen';
import ItemDetailScreen from '../screens/Lists/ItemDetailScreen';
import AddListScreen from '../screens/Lists/AddListScreen';

// Common (Moved files)
import RepeatScreen from '../screens/Common/RepeatScreen'; 

// Other Features
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import NewEventScreen from '../screens/Calendar/NewEventScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import NewTransactionScreen from '../screens/Budget/NewTransactionScreen';
import DocumentsScreen from '../screens/Documents/DocumentsScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import RecipeBoxScreen from '../screens/RecipeBox/RecipeBoxScreen';

const Stack = createNativeStackNavigator();

const HubStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Hub & Settings */}
      <Stack.Screen name="Hub" component={HubScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* Lists Feature */}
      <Stack.Screen name="Lists" component={ListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen 
        name="AddItem" 
        component={AddItemScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen 
        name="AddList" 
        component={AddListScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Repeat" component={RepeatScreen} />

      {/* Calendar Feature */}
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen 
        name="NewEvent" 
        component={NewEventScreen} 
        options={{ presentation: 'modal' }}
      />

     
      <Stack.Screen name="Budget" component={BudgetScreen} />
      {/* 2. ADD THE NEW SCREEN */}
      <Stack.Screen 
        name="NewTransaction" 
        component={NewTransactionScreen} 
        options={{ presentation: 'modal' }}
      />
       {/* Other Features */}
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
      <Stack.Screen name="RecipeBox" component={RecipeBoxScreen} />
    </Stack.Navigator>
  );
};

export default HubStack;