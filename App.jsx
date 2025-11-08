import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { FamilyProvider } from './src/contexts/FamilyContext';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <AuthProvider>
      {/* Wrap FamilyProvider INSIDE AuthProvider.
        This is critical so FamilyContext can use the useAuth() hook.
      */}
      <FamilyProvider>
        <RootNavigator />
      </FamilyProvider>
    </AuthProvider>
  );
};

export default App;