import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../screens/Common/SplashScreen';
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import MainAppTabs from './MainAppTabs';
import { StatusBar } from 'react-native';

// --- MOCK NAVIGATION STATE ---
// Change these values to test different navigation flows.
//
// 1. To test "Signed Out" (AuthStack):
//    const mockUser = null;
//    const mockFamilyId = null;
//    const mockLoading = false;
//
// 2. To test "Signed In, No Family" (OnboardingStack):
//    const mockUser = { uid: 'fake-user-id' };
//    const mockFamilyId = null;
//    const mockLoading = false;
//
// 3. To test "Signed In, With Family" (MainAppTabs):
   const mockUser = { uid: 'fake-user-id' };
   const mockFamilyId = 'fake-family-id';
   const mockLoading = false;
//
// 4. To test "Loading" (SplashScreen):
//    const mockUser = null;
//    const mockFamilyId = null;
//    const mockLoading = true;
//
// -----------------------------

const RootNavigator = () => {
  // We comment out the *real* hook for now
  // const { user, loading } = useAuth();
  
  // And use our mock values instead
  const user = mockUser;
  const familyId = mockFamilyId;
  const loading = mockLoading;

  // This is the full navigation logic from Section 3.0
  const renderNavigator = () => {
    if (loading) {
      return <SplashScreen />;
    }
    
    if (!user) {
      return <AuthStack />;
    }
    
    // This is the logic we will *really* implement next
    // using the FamilyContext
    if (user && !familyId) {
      return <OnboardingStack />;
    }
    
    if (user && familyId) {
      return <MainAppTabs />;
    }
    
    // Default fallback
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