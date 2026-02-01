import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../hooks/useFamily';
import SplashScreen from '../screens/Common/SplashScreen';
import AuthStack from './AuthStack';
import OnboardingStack from './OnboardingStack';
import { StatusBar } from 'react-native';

// IMPORT THE NEW STACK
import MainStack from './MainStack'; 

const RootNavigator = () => {
  const { user, loading: loadingAuth } = useAuth();
  const { familyId, loadingFamily } = useFamily();

  if (loadingAuth || loadingFamily) {
    return <SplashScreen />;
  }

  const renderNavigator = () => {
    if (!user) {
      return <AuthStack />;
    }
    
    if (user && !familyId) {
      return <OnboardingStack />;
    }
    
    if (user && familyId) {
      // CHANGE THIS LINE: Return MainStack instead of MainAppTabs
      return <MainStack />;
    }

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