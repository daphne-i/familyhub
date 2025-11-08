import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../hooks/useFamily'; // Using the clean hook path
import SplashScreen from '../screens/Common/SplashScreen';
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import MainAppTabs from './MainAppTabs';
import { StatusBar } from 'react-native';

// This is the "Brain" of the app, as per section 3.0
// All mocks are removed. This is the final production logic.
const RootNavigator = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { familyId, loadingFamily } = useFamily();

  // Show splash screen if either auth state or family state is loading
  if (loadingAuth || loadingFamily) {
    return <SplashScreen />;
  }

  // Render logic from Section 3.0 of your design doc
  const renderNavigator = () => {
    if (!user) {
      // 1. User is null: Show AuthStack
      return <AuthStack />;
    }
    
    if (user && !familyId) {
      // 2. User exists but familyId is null: Show OnboardingStack
      return <OnboardingStack />;
    }
    
    if (user && familyId) {
      // 3. User and familyId exist: Show MainAppTabs
      return <MainAppTabs />;
    }

    // Default fallback (shouldn't be reached)
    return <AuthStack />;
  };

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {renderNavigator()}
    </NavigationContainer>
  );
};

export default RootNavigator;