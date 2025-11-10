import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
// 1. IMPORT THE NEW HUBSTACK
import HubStack from './HubStack';
import * as theme from '../utils/theme';

const { COLORS, FONT_SIZES, SPACING } = theme;
const Tab = createBottomTabNavigator();

// --- We define the icon components *outside* the MainAppTabs component ---
const renderDashboardIcon = ({ color, size }) => (
  <Home size={size} color={color} strokeWidth={2.5} />
);

const renderHubIcon = ({ color, size }) => (
  <LayoutGrid size={size} color={color} strokeWidth={2.5} />
);

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
          tabBarIcon: renderDashboardIcon,
        }}
      />
      <Tab.Screen
        name="Hub"
        // 2. USE THE HUBSTACK (not HubScreen)
        component={HubStack}
        options={{
          tabBarLabel: 'Hub',
          tabBarIcon: renderHubIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainAppTabs;