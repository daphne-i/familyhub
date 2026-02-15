import React, { createContext, useState, useEffect, useContext } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './AuthContext';

const FamilyContext = createContext();

const FamilyProvider = ({ children }) => {
  const { user } = useAuth();
  const [familyId, setFamilyId] = useState(null);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [membersList, setMembersList] = useState([]);
  const [familyDoc, setFamilyDoc] = useState(null);

  // Debugging logs
  useEffect(() => {
    console.log(`[FamilyContext] Current User: ${user ? user.uid : 'No User'}`);
    console.log(`[FamilyContext] Current FamilyId: ${familyId}`);
  }, [user, familyId]);

  // Effect 1: Get the user's familyId
  useEffect(() => {
    if (user) {
      console.log('[FamilyContext] Setting up user listener...');
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (documentSnapshot) => {
            const userData = documentSnapshot.data();
            console.log('[FamilyContext] User doc update received:', userData);
            
            if (documentSnapshot.exists && userData && userData.familyId) {
              console.log('[FamilyContext] Found familyId:', userData.familyId);
              setFamilyId(userData.familyId);
            } else {
              console.log('[FamilyContext] No familyId found on user doc.');
              setFamilyId(null);
            }
            setLoadingFamily(false);
          },
          (error) => {
            console.error('[FamilyContext] Error fetching user doc:', error);
            setFamilyId(null);
            setLoadingFamily(false);
          },
        );
      return () => unsubscribe();
    } else {
      setFamilyId(null);
      setLoadingFamily(false);
      setMembersList([]);
      setFamilyDoc(null);
    }
  }, [user]);

  // Effect 2: Get family details
  useEffect(() => {
    if (!familyId) {
      setMembersList([]);
      setFamilyDoc(null);
      return;
    }

    const familySub = firestore()
      .collection('families')
      .doc(familyId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            // FIX: Safely extract data so doc.data() is never undefined
            const data = doc.data() || {};
            setFamilyDoc({ id: doc.id, ...data });

            // FIX: Safely look for members
            const memberIds = data.members || [];
            if (memberIds.length > 0) {
              const membersSub = firestore()
                .collection('users')
                .where(firestore.FieldPath.documentId(), 'in', memberIds)
                .onSnapshot((querySnapshot) => {
                  const members = [];
                  querySnapshot.forEach((userDoc) => {
                    members.push({ id: userDoc.id, ...userDoc.data() });
                  });
                  setMembersList(members);
                });
              return () => membersSub();
            } else {
              setMembersList([]);
            }
          } else {
            // FIX: If the family doc was deleted, reset everything
            // This will tell the RootNavigator to send them to the Onboarding Screen
            console.log('[FamilyContext] Family doc not found! Resetting state.');
            setFamilyDoc(null);
            setMembersList([]);
            setFamilyId(null);
          }
        },
        (error) => {
          console.error('[FamilyContext] Error fetching family doc:', error);
        }
      );

    return () => familySub();
  }, [familyId]);

  return (
    <FamilyContext.Provider
      value={{
        familyId,
        loadingFamily,
        familyDoc,
        membersList,
      }}>
      {children}
    </FamilyContext.Provider>
  );
};

const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export { FamilyProvider, useFamily };