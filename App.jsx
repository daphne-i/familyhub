import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 1. IMPORT
import { AuthProvider } from './src/contexts/AuthContext';
import { FamilyProvider } from './src/contexts/FamilyContext';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    // 2. WRAP YOUR APP WITH IT
    <SafeAreaProvider>
      <AuthProvider>
        <FamilyProvider>
          <RootNavigator />
        </FamilyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
