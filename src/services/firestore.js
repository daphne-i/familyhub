import firestore from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../hooks/useFamily';

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