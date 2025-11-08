import React, { createContext, useState, useEffect, useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

// 1. Create the Context
const FamilyContext = createContext();

// 2. Create the Provider
const FamilyProvider = ({ children }) => {
  const { user } = useAuth(); // Get the logged-in user
  const [familyId, setFamilyId] = useState(null);
  const [loadingFamily, setLoadingFamily] = useState(true);

  useEffect(() => {
    if (user) {
      // If user is logged in, subscribe to their user document
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (documentSnapshot) => {
            // --- FIX IS HERE ---
            // Get data first
            const userData = documentSnapshot.data();
            
            // Check that doc exists AND data is not undefined
            if (documentSnapshot.exists && userData) { 
            // --- END FIX ---
              
              // Get the familyId from the doc. 
              // Safely check if familyId exists on the object.
              setFamilyId(userData.familyId || null);
            } else {
              // This can happen if the user doc isn't created yet or is empty
              setFamilyId(null);
            }
            setLoadingFamily(false);
          },
          (error) => {
            console.error('FamilyContext: Error fetching user doc:', error);
            setFamilyId(null);
            setLoadingFamily(false);
          }
        );

      return () => unsubscribe(); // Unsubscribe on unmount
    } else {
      // No user, so no family
      setFamilyId(null);
      setLoadingFamily(false);
    }
  }, [user]); // Re-run this effect when the user logs in or out

  return (
    <FamilyContext.Provider value={{ familyId, loadingFamily }}>
      {children}
    </FamilyContext.Provider>
  );
};

// 3. Create the custom hook
const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export { FamilyProvider, useFamily };