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
  const [membersList, setMembersList] = useState([]); // NEW: List of member objects
  const [familyDoc, setFamilyDoc] = useState(null); // NEW: The family doc itself

  // Effect 1: Get the user's familyId
  useEffect(() => {
    if (user) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (documentSnapshot) => {
            const userData = documentSnapshot.data();
            if (documentSnapshot.exists && userData) {
              setFamilyId(userData.familyId || null);
            } else {
              setFamilyId(null);
            }
            setLoadingFamily(false);
          },
          (error) => {
            console.error('FamilyContext: Error fetching user doc:', error);
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

  // Effect 2: Get family details and members *after* we have a familyId
  useEffect(() => {
    if (!familyId) {
      setMembersList([]);
      setFamilyDoc(null);
      return;
    }

    // A. Listen to the family document itself
    const familySub = firestore()
      .collection('families')
      .doc(familyId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setFamilyDoc({ id: doc.id, ...doc.data() });

          // B. Now fetch the members listed in the family doc
          const memberIds = doc.data().members || [];
          if (memberIds.length > 0) {
            // C. Listen to all user documents that are in the members array
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
            return () => membersSub(); // Unsubscribe from members listener
          } else {
            setMembersList([]); // No member IDs
          }
        } else {
          // Family doc doesn't exist
          setFamilyDoc(null);
          setMembersList([]);
        }
      });

    return () => familySub(); // Unsubscribe from family listener
  }, [familyId]); // This effect re-runs when familyId changes

  return (
    <FamilyContext.Provider
      value={{
        familyId,
        loadingFamily,
        familyDoc, // e.g., for familyName, inviteCode
        membersList, // The full list of user objects
      }}>
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