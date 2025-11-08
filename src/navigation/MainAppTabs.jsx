import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid } from 'lucide-react-native'; // Using lucide icons as specified
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import HubScreen from '../screens/Hub/HubScreen';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();

// As per section 4.0, this is the main 2-tab navigator
const MainAppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text_light,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') {
            return <Home color={color} size={size} />;
          } else if (route.name === 'Hub') {
            return <LayoutGrid color={color} size={size} />;
          }
        },
        // Styling based on the Dashboard screenshot
        tabBarStyle: {
          backgroundColor: COLORS.background_white,
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          height: 70, // A bit taller for the rounded look
          paddingBottom: 10,
          paddingTop: 10,
          // These props are not standard but often faked with wrapper Views
          // For now, a standard bar is fine. We can customize later.
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Hub" component={HubScreen} />
    </Tab.Navigator>
  );
};

export default MainAppTabs;