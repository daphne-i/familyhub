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
import FolderDetailScreen from '../screens/Documents/FolderDetailScreen';
import FileViewerScreen from '../screens/Documents/FileViewerScreen';
import RecipeBoxScreen from '../screens/RecipeBox/RecipeBoxScreen';
import RecipeDetailScreen from '../screens/RecipeBox/RecipeDetailScreen';
import EditRecipeScreen from '../screens/RecipeBox/EditRecipeScreen';
import AddRecipeToMealPlannerScreen from '../screens/RecipeBox/AddRecipeToMealPlannerScreen';
import MealPlannerScreen from '../screens/MealPlanner/MealPlannerScreen';
import EditInstructionsScreen from '../screens/RecipeBox/EditInstructionsScreen';

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
      {/* Documents Feature */}
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      {/* 2. Register the screen here */}
      <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
      <Stack.Screen 
        name="FileViewer" 
        component={FileViewerScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }} 
      />
       {/* Other Features */}
      <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
  {/* Recipe Box Routes (NEW) */}
      <Stack.Screen name="RecipeBox" component={RecipeBoxScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
      <Stack.Screen name="EditInstructions" component={EditInstructionsScreen} />
      <Stack.Screen name="AddRecipeToMealPlanner" component={AddRecipeToMealPlannerScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
};

export default HubStack;