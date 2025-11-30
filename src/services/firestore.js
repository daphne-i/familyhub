import firestore from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../hooks/useFamily';
// 1. NEW IMPORT for repeating logic
import { addDays, addWeeks, addMonths, addYears, isSaturday, isSunday } from 'date-fns';

/**
 * A reusable hook to get a Firestore collection in real-time.
 * @param {string} collectionPath The path to the collection (e.g., 'lists')
 * @returns {object} { data: array, loading: boolean, error: object, refresh: function }
 */
export const useFamilyCollection = (collectionPath) => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user || !familyId || !collectionPath) {
      setLoading(false);
      return;
    }

    const path = `families/${familyId}/${collectionPath}`;
    
    const unsubscribe = firestore()
      .collection(path)
      .onSnapshot(
        (querySnapshot) => {
          const collectionData = [];
          querySnapshot.forEach((doc) => {
            collectionData.push({ id: doc.id, ...doc.data() });
          });
          
          setData((prevData) => {
            const prevDataString = JSON.stringify(prevData);
            const newDataString = JSON.stringify(collectionData);
            
            if (prevDataString === newDataString) {
              return prevData;
            } else {
              return collectionData;
            }
          });
          
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching collection ${path}:`, err);
          setError(err);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, [user, familyId, collectionPath, refreshTrigger]);

  const refresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  return { data, loading, error, refresh };
};

/**
 * --- UPDATED COLLECTION GROUP HOOK ---
 * A hook to get all documents from a collection group (e.g., all 'items')
 * @param {string} collectionId The ID of the collection group (e.g., 'items')
 * @param {Date} startDate The date to query from
 * @returns {object} { data: array, loading: boolean, error: object }
 */
export const useFamilyCollectionGroup = (collectionId, startDate) => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !familyId || !collectionId || !startDate) {
      setLoading(false);
      return;
    }

    // Convert JS Date to Firestore Timestamp
    const startTimestamp = firestore.Timestamp.fromDate(startDate);

    const unsubscribe = firestore()
      .collectionGroup(collectionId)
      .where('familyId', '==', familyId)
      .where('dueDate', '>=', startTimestamp) // Only get items from today onwards
      .onSnapshot(
        (querySnapshot) => {
          const collectionData = [];
          querySnapshot.forEach((doc) => {
            // --- THIS IS THE FIX ---
            // The path is 'families/{familyId}/lists/{listId}/items/{itemId}'
            // We split by '/' and get the listId, which is at index 3
            const pathParts = doc.ref.path.split('/');
            const listId = pathParts.length > 3 ? pathParts[3] : null;
            // --- END FIX ---

            collectionData.push({ 
              id: doc.id, 
              listId: listId, // Add the listId to the object
              ...doc.data() 
            });
          });
          
          setData((prevData) => {
            const prevDataString = JSON.stringify(prevData);
            const newDataString = JSON.stringify(collectionData);
            if (prevDataString === newDataString) {
              return prevData;
            } else {
              return collectionData;
            }
          });
          
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching collection group ${collectionId}:`, err);
          setError(err);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, [user, familyId, collectionId, startDate]);

  return { data, loading, error };
};

/**
 * A reusable hook to get a single Firestore document in real-time.
 * @param {string} docPath The path to the document (e.g., 'lists/LIST_ID/items/ITEM_ID')
 * @returns {object} { data: object, loading: boolean, error: object }
 */
export const useFamilyDocument = (docPath) => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !familyId || !docPath) {
      setLoading(false);
      return;
    }

    const path = `families/${familyId}/${docPath}`;

    const unsubscribe = firestore()
      .doc(path)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setData({ id: doc.id, ...doc.data() });
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error(`Error fetching document ${path}:`, err);
          setError(err);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, [user, familyId, docPath]);

  return { data, loading, error };
};

export const useBudget = (monthId) => {
  return useFamilyDocument(`budget/${monthId}`);
};

/**
 * Adds a new document to a top-level family collection (e.g., 'lists')
 * @param {string} familyId The family ID.
 * @param {string} collectionPath The path to the collection (e.g., 'lists')
 * @param {object} data The data for the new document.
 */
export const addFamilyDoc = async (familyId, collectionPath, data) => {
  if (!familyId || !collectionPath || !data) {
    throw new Error('Missing data for addFamilyDoc');
  }

  try {
    const path = `families/${familyId}/${collectionPath}`;
    await firestore().collection(path).add({
      ...data,
      // createdAt is now handled by the specific function
    });
  } catch (error) {
    console.error('Error adding document: ', error);
    throw new Error('Failed to add document. Please try again.');
  }
};

/**
 * Adds a new item to a list's subcollection.
 * @param {string} familyId The family ID.
 * @param {string} listId The ID of the parent list.
 * @param {object} itemData The data for the new item.
 */
export const addListItem = async (familyId, listId, itemData) => {
  if (!familyId || !listId || !itemData) {
    throw new Error('Missing data for addItem');
  }
  
  try {
    const path = `families/${familyId}/lists/${listId}/items`;
    await firestore().collection(path).add({
      ...itemData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding item to list: ', error);
    throw new Error('Failed to add item. Please try again.');
  }
};

/**
 * Updates an item in a list's subcollection.
 * @param {string} familyId The family ID.
 * @param {string} listId The ID of the parent list.
 * @param {string} itemId The ID of the item to update.
 * @param {object} updates The fields to update.
 */
export const updateListItem = async (familyId, listId, itemId, updates) => {
  if (!familyId || !listId || !itemId || !updates) {
    throw new Error('Missing data for updateItem');
  }
  
  try {
    const path = `families/${familyId}/lists/${listId}/items/${itemId}`;
    await firestore().doc(path).update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating list item: ', error);
    throw new Error('Failed to update item. Please try again.');
  }
};

/**
 * Adds a comment to a list item.
 * @param {string} familyId The family ID.
 * @param {string} listId The ID of the parent list.
 * @param {string} itemId The ID of the item.
 * @param {object} commentData The comment data (text, sentBy).
 */
export const addItemComment = async (familyId, listId, itemId, commentData) => {
  if (!familyId || !listId || !itemId || !commentData) {
    throw new Error('Missing data for addComment');
  }

  try {
    const path = `families/${familyId}/lists/${listId}/items/${itemId}/comments`;
    await firestore().collection(path).add({
      ...commentData,
      sentAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding comment: ', error);
    throw new Error('Failed to add comment. Please try again.');
  }
};

/**
 * Deletes an item from a list's subcollection.
 * @param {string} familyId The family ID.
 * @param {string} listId The ID of the parent list.
 * @param {string} itemId The ID of the item to delete.
 */
export const deleteListItem = async (familyId, listId, itemId) => {
  if (!familyId || !listId || !itemId) {
    throw new Error('Missing data for deleteItem');
  }

  try {
    const path = `families/${familyId}/lists/${listId}/items/${itemId}`;
    await firestore().doc(path).delete();
  } catch (error) {
    console.error('Error deleting list item: ', error);
    throw new Error('Failed to delete item. Please try again.');
  }
};

// --- CALENDAR FUNCTIONS ---

/**
 * Adds a new event to the 'calendar' collection.
 * @param {string} familyId The family ID.
 * @param {object} eventData The data for the new event.
 */
export const addCalendarEvent = async (familyId, eventData) => {
  if (!familyId || !eventData) {
    throw new Error('Missing data for addCalendarEvent');
  }
  
  try {
    await addFamilyDoc(familyId, 'calendar', {
      ...eventData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding calendar event: ', error);
    throw new Error('Failed to add event. Please try again.');
  }
};

/**
 * Updates an event in the 'calendar' collection.
 * @param {string} familyId The family ID.
 * @param {string} eventId The ID of the event to update.
 * @param {object} updates The fields to update.
 */
export const updateCalendarEvent = async (familyId, eventId, updates) => {
  if (!familyId || !eventId || !updates) {
    throw new Error('Missing data for updateCalendarEvent');
  }
  
  try {
    const path = `families/${familyId}/calendar/${eventId}`;
    await firestore().doc(path).update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating calendar event: ', error);
    throw new Error('Failed to update event. Please try again.');
  }
};

/**
 * Deletes an event from the 'calendar' collection.
 * @param {string} familyId The family ID.
 * @param {string} eventId The ID of the event to delete.
 */
export const deleteCalendarEvent = async (familyId, eventId) => {
  if (!familyId || !eventId) {
    throw new Error('Missing data for deleteCalendarEvent');
  }

  try {
    const path = `families/${familyId}/calendar/${eventId}`;
    await firestore().doc(path).delete();
  } catch (error) {
    console.error('Error deleting calendar event: ', error);
    throw new Error('Failed to delete event. Please try again.');
  }
};

// --- BUDGET FUNCTIONS ---

// --- BUDGET FUNCTIONS ---

const calculateNextDate = (currentDate, interval) => {
  switch (interval) {
    case 'Every day': return addDays(currentDate, 1);
    case 'Every weekday':
      let next = addDays(currentDate, 1);
      if (isSaturday(next)) next = addDays(next, 2);
      else if (isSunday(next)) next = addDays(next, 1);
      return next;
    case 'Every week': return addWeeks(currentDate, 1);
    case 'Every two weeks': return addWeeks(currentDate, 2);
    case 'Every month': return addMonths(currentDate, 1);
    case 'Every year': return addYears(currentDate, 1);
    default: return addDays(currentDate, 1);
  }
};

/**
 * Adds a new transaction. If repeating, links them with a seriesId.
 */
export const addTransaction = async (familyId, transactionData) => {
  if (!familyId || !transactionData) throw new Error('Missing data');

  const { date, amount, type, repeat } = transactionData;
  const startDate = date.toDate ? date.toDate() : new Date(date);
  
  // 1. Generate a unique Series ID if this is a repeating transaction
  const isRepeating = repeat && repeat !== 'One time only';
  const seriesId = isRepeating ? firestore().collection('placeholder').doc().id : null;

  const transactionsToAdd = [];

  // Initial transaction
  transactionsToAdd.push({
    ...transactionData,
    date: firestore.Timestamp.fromDate(startDate),
    seriesId: seriesId, // Link the series
  });

  // Future transactions
  if (isRepeating) {
    const endDate = addYears(startDate, 10); // Cap at 10 years
    let nextDate = calculateNextDate(startDate, repeat);

    while (nextDate <= endDate) {
      transactionsToAdd.push({
        ...transactionData,
        date: firestore.Timestamp.fromDate(nextDate),
        seriesId: seriesId, // Link the series
      });
      nextDate = calculateNextDate(nextDate, repeat);
    }
  }

  console.log(`Generating ${transactionsToAdd.length} transactions (Series ID: ${seriesId})...`);

  // Batch Write (Max 500 ops per batch)
  const chunkSize = 200;
  for (let i = 0; i < transactionsToAdd.length; i += chunkSize) {
    const chunk = transactionsToAdd.slice(i, i + chunkSize);
    const batch = firestore().batch();

    chunk.forEach((tx) => {
      const txRef = firestore().collection(`families/${familyId}/transactions`).doc();
      
      const txDate = tx.date.toDate();
      const year = txDate.getFullYear();
      const month = (txDate.getMonth() + 1).toString().padStart(2, '0');
      const budgetId = `${year}-${month}`;
      const budgetRef = firestore().doc(`families/${familyId}/budget/${budgetId}`);

      batch.set(txRef, {
        ...tx,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      const amountChange = tx.type === 'Expense' ? tx.amount : 0;
      const incomeChange = tx.type === 'Income' ? tx.amount : 0;

      batch.set(budgetRef, {
        totalSpent: firestore.FieldValue.increment(amountChange),
        totalIncome: firestore.FieldValue.increment(incomeChange),
        month: txDate.getMonth() + 1,
        year: year,
        updatedAt: firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();
  }
};
/**
 * Updates a transaction and adjusts the budget totals accordingly.
 * Handles cases where amount, type, or date (month) changes.
 */
export const updateTransaction = async (familyId, transactionId, oldTxData, newTxData) => {
  if (!familyId || !transactionId || !oldTxData || !newTxData) return;

  const oldDate = oldTxData.date.toDate ? oldTxData.date.toDate() : new Date(oldTxData.date);
  const newDate = newTxData.date.toDate ? newTxData.date.toDate() : newTxData.date;
  
  const oldBudgetId = `${oldDate.getFullYear()}-${(oldDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const newBudgetId = `${newDate.getFullYear()}-${(newDate.getMonth() + 1).toString().padStart(2, '0')}`;

  const oldBudgetRef = firestore().doc(`families/${familyId}/budget/${oldBudgetId}`);
  const newBudgetRef = firestore().doc(`families/${familyId}/budget/${newBudgetId}`);
  const transactionRef = firestore().doc(`families/${familyId}/transactions/${transactionId}`);

  try {
    await firestore().runTransaction(async (t) => {
      // 1. Revert old amount from old budget
      const oldBudgetDoc = await t.get(oldBudgetRef);
      let oldSpent = oldBudgetDoc.exists ? (oldBudgetDoc.data().totalSpent || 0) : 0;
      let oldIncome = oldBudgetDoc.exists ? (oldBudgetDoc.data().totalIncome || 0) : 0;

      if (oldTxData.type === 'Expense') oldSpent -= oldTxData.amount;
      else oldIncome -= oldTxData.amount;

      // 2. Add new amount to new budget
      let newSpent = (oldBudgetId === newBudgetId) ? oldSpent : 0;
      let newIncome = (oldBudgetId === newBudgetId) ? oldIncome : 0;

      if (oldBudgetId !== newBudgetId) {
        const newBudgetDoc = await t.get(newBudgetRef);
        newSpent = newBudgetDoc.exists ? (newBudgetDoc.data().totalSpent || 0) : 0;
        newIncome = newBudgetDoc.exists ? (newBudgetDoc.data().totalIncome || 0) : 0;
        
        t.set(oldBudgetRef, { totalSpent: oldSpent, totalIncome: oldIncome }, { merge: true });
      }

      if (newTxData.type === 'Expense') newSpent += newTxData.amount;
      else newIncome += newTxData.amount;

      // Write the update to the NEW budget
      t.set(newBudgetRef, {
        totalSpent: newSpent,
        totalIncome: newIncome,
        month: newDate.getMonth() + 1,
        year: newDate.getFullYear(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 3. Update the Transaction Document
      t.update(transactionRef, {
        ...newTxData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Deletes transactions.
 * Handles large deletions (over 500 items) by chunking batches.
 */
export const deleteTransaction = async (familyId, transactionId, transactionData, deleteScope = 'single') => {
  if (!familyId || !transactionId || !transactionData) return;

  // --- CASE 1: Single Delete ---
  if (deleteScope === 'single' || !transactionData.seriesId) {
    const { amount, type, date } = transactionData;
    // Handle Firestore Timestamp or JS Date
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const budgetId = `${year}-${month}`;
    
    const budgetRef = firestore().doc(`families/${familyId}/budget/${budgetId}`);
    const txRef = firestore().doc(`families/${familyId}/transactions/${transactionId}`);

    try {
      await firestore().runTransaction(async (t) => {
        const budgetDoc = await t.get(budgetRef);
        if (budgetDoc.exists) {
          // Use atomic increment to reverse the amount
          const fieldToUpdate = type === 'Expense' ? 'totalSpent' : 'totalIncome';
          // decrement by adding negative amount
          t.update(budgetRef, {
            [fieldToUpdate]: firestore.FieldValue.increment(-amount),
            updatedAt: firestore.FieldValue.serverTimestamp()
          });
        }
        t.delete(txRef);
      });
      console.log('Single transaction deleted successfully.');
    } catch (error) {
      console.error('Error deleting single transaction:', error);
      throw error;
    }
    return;
  }

  // --- CASE 2: Bulk Delete (Future Events) ---
  if (deleteScope === 'future') {
    const { seriesId, date, type } = transactionData;
    const startDate = date.toDate ? date.toDate() : new Date(date);

    try {
      // 1. Find all future transactions
      const snapshot = await firestore()
        .collection(`families/${familyId}/transactions`)
        .where('seriesId', '==', seriesId)
        .where('date', '>=', firestore.Timestamp.fromDate(startDate))
        .get();

      if (snapshot.empty) {
        console.log('No future transactions found.');
        return;
      }

      console.log(`Found ${snapshot.size} future transactions to delete.`);

      // 2. Calculate budget impacts
      // Map: "2025-11" -> totalAmountToRemove
      const budgetChanges = {};
      const allDocs = snapshot.docs;

      allDocs.forEach(doc => {
        const data = doc.data();
        const txDate = data.date.toDate();
        const bId = `${txDate.getFullYear()}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!budgetChanges[bId]) budgetChanges[bId] = 0;
        budgetChanges[bId] += (data.amount || 0);
      });

      // 3. Process in Chunks (Batch limit is 500)
      // We need to batch both the deletes AND the budget updates.
      const BATCH_SIZE = 400; // Safe limit below 500
      const operations = [];

      // A. Add Delete Operations
      allDocs.forEach(doc => {
        operations.push({ type: 'delete', ref: doc.ref });
      });

      // B. Add Budget Update Operations
      Object.keys(budgetChanges).forEach(bId => {
        const budgetRef = firestore().doc(`families/${familyId}/budget/${bId}`);
        const amountToRemove = budgetChanges[bId];
        const field = type === 'Expense' ? 'totalSpent' : 'totalIncome';
        
        operations.push({
          type: 'update',
          ref: budgetRef,
          data: {
            [field]: firestore.FieldValue.increment(-amountToRemove),
            updatedAt: firestore.FieldValue.serverTimestamp()
          }
        });
      });

      // C. Execute Batches
      for (let i = 0; i < operations.length; i += BATCH_SIZE) {
        const batch = firestore().batch();
        const chunk = operations.slice(i, i + BATCH_SIZE);

        chunk.forEach(op => {
          if (op.type === 'delete') {
            batch.delete(op.ref);
          } else if (op.type === 'update') {
            // Using set with merge is safer than update if doc might not exist (though unlikely for budget)
            batch.set(op.ref, op.data, { merge: true });
          }
        });

        await batch.commit();
        console.log(`Committed batch ${i / BATCH_SIZE + 1}`);
      }

    } catch (error) {
      console.error('Error deleting future transactions:', error);
      // Check for index error
      if (error.message.includes('The query requires an index')) {
        throw new Error('System Error: Database index missing. Please contact developer.');
      }
      throw error;
    }
  }
};

/**
 * Adds a custom transaction category.
 */
export const addBudgetCategory = async (familyId, categoryData) => {
  if (!familyId || !categoryData) throw new Error('Missing data');
  await addFamilyDoc(familyId, 'budgetCategories', {
    ...categoryData, // { name, icon, type }
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Adds a custom account (e.g., "Secret Stash").
 */
export const addBudgetAccount = async (familyId, accountData) => {
  if (!familyId || !accountData) throw new Error('Missing data');
  await addFamilyDoc(familyId, 'budgetAccounts', {
    ...accountData, // { name, icon }
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};
// --- DOCUMENTS FUNCTIONS ---

/**
 * Adds a new folder to the 'docFolders' collection.
 * @param {string} familyId
 * @param {string} folderName
 */
export const addFolder = async (familyId, folderName) => {
  if (!familyId || !folderName) throw new Error('Missing data');

  try {
    await addFamilyDoc(familyId, 'docFolders', {
      name: folderName,
      fileCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding folder:', error);
    throw error;
  }
};
/**
 * Hook to fetch documents inside a specific folder.
 */
export const useFolderDocuments = (folderId) => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !familyId || !folderId) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection(`families/${familyId}/documents`)
      .where('folderId', '==', folderId)
      .orderBy('uploadedAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const docs = [];
          querySnapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
          setData(docs);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching documents:', err);
          setError(err);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, [user, familyId, folderId]);

  return { data, loading, error };
};

/**
 * Adds a document metadata entry and increments the folder's file count.
 * Note: The actual file upload to Storage happens in the UI before calling this.
 */
export const addDocument = async (familyId, folderId, docData) => {
  if (!familyId || !folderId || !docData) throw new Error('Missing data');

  const docRef = firestore().collection(`families/${familyId}/documents`).doc();
  const folderRef = firestore().doc(`families/${familyId}/docFolders/${folderId}`);

  try {
    await firestore().runTransaction(async (t) => {
      // 1. Create the document
      t.set(docRef, {
        ...docData,
        folderId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        uploadedAt: firestore.FieldValue.serverTimestamp(),
      });

      // 2. Increment file count on the folder
      t.update(folderRef, {
        fileCount: firestore.FieldValue.increment(1),
      });
    });
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

/**
 * Deletes a document and decrements the folder's file count.
 */
export const deleteDocument = async (familyId, folderId, documentId) => {
  if (!familyId || !folderId || !documentId) return;

  const docRef = firestore().doc(`families/${familyId}/documents/${documentId}`);
  const folderRef = firestore().doc(`families/${familyId}/docFolders/${folderId}`);

  try {
    await firestore().runTransaction(async (t) => {
      t.delete(docRef);
      t.update(folderRef, {
        fileCount: firestore.FieldValue.increment(-1),
      });
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};/**
 * Updates the budget limit for a specific month.
 * Creates the budget document if it doesn't exist.
 */
export const updateBudgetLimit = async (familyId, monthId, newLimit) => {
  if (!familyId || !monthId || newLimit === undefined) return;

  const budgetRef = firestore().doc(`families/${familyId}/budget/${monthId}`);
  
  try {
    // Use set with merge: true to create if missing, or update if exists
    await budgetRef.set({
      totalLimit: newLimit,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      // Ensure month/year fields exist if we are creating the doc for the first time
      month: parseInt(monthId.split('-')[1], 10),
      year: parseInt(monthId.split('-')[0], 10),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating budget limit:', error);
    throw error;
  }
};

// --- RECIPE FUNCTIONS ---

/**
 * Adds a new recipe.
 */
export const addRecipe = async (familyId, recipeData) => {
  if (!familyId || !recipeData) throw new Error('Missing data');
  await addFamilyDoc(familyId, 'recipes', {
    ...recipeData,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Updates an existing recipe.
 */
export const updateRecipe = async (familyId, recipeId, updates) => {
  if (!familyId || !recipeId || !updates) throw new Error('Missing data');

  const path = `families/${familyId}/recipes/${recipeId}`;
  await firestore().doc(path).update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Deletes a recipe.
 */
export const deleteRecipe = async (familyId, recipeId) => {
  if (!familyId || !recipeId) throw new Error('Missing data');

  const path = `families/${familyId}/recipes/${recipeId}`;
  await firestore().doc(path).delete();
};