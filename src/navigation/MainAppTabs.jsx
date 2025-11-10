import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import HubScreen from '../screens/Hub/HubScreen';
import * as theme from '../utils/theme';

const { COLORS, FONT_SIZES, SPACING } = theme;
const Tab = createBottomTabNavigator();

// --- ESLINT FIX ---
// We define the icon components *outside* the MainAppTabs component.
// This prevents them from being recreated on every render.
const renderDashboardIcon = ({ color, size }) => (
  <Home size={size} color={color} strokeWidth={2.5} />
);

const renderHubIcon = ({ color, size }) => (
  <LayoutGrid size={size} color={color} strokeWidth={2.5} />
);
// --- END FIX ---

const MainAppTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text_light,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom - SPACING.sm : SPACING.sm,
          paddingTop: SPACING.sm,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.sm,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          // Reference the stable function
          tabBarIcon: renderDashboardIcon,
        }}
      />
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{
          tabBarLabel: 'Hub',
          // Reference the stable function
          tabBarIcon: renderHubIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainAppTabs;