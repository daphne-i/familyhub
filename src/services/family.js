import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

/**
 * Calls the 'createFamily' cloud function.
 * As per Section 11.0, this function will create the family,
 * generate an invite code, and set the user's familyId.
 */
export const createFamily = async (familyName) => {
  if (!familyName) {
    throw new Error('Family name is required.');
  }
  try {
    const createFamilyCallable = functions().httpsCallable('createFamily');
    const result = await createFamilyCallable({ familyName });

    if (result.data?.status === 'error') {
      throw new Error(result.data.message || 'Failed to create family.');
    }
    // Success! The RootNavigator will auto-detect the new familyId
    // from the FamilyContext listener and navigate to the MainAppTabs.
    return result.data;
  } catch (error) {
    console.error('createFamily error:', error);
    // Provide a user-friendly error
    if (error.code === 'functions/unavailable') {
       throw new Error('Our servers are busy, please try again in a moment.');
    }
    throw new Error(error.message || 'An unknown error occurred.');
  }
};

/**
 * Calls the 'joinFamily' cloud function.
 * As per Section 11.0, this validates the code
 * and adds the user to the family.
 */
export const joinFamily = async (inviteCode) => {
  if (!inviteCode) {
    throw new Error('Invite code is required.');
  }
  try {
    const joinFamilyCallable = functions().httpsCallable('joinFamily');
    const result = await joinFamilyCallable({ inviteCode });

    if (result.data?.status === 'error') {
      throw new Error(result.data.message || 'Invalid invite code.');
    }
    // Success! The RootNavigator will auto-detect the new familyId
    // and navigate to the MainAppTabs.
    return result.data;
  } catch (error) {
    console.error('joinFamily error:', error);
    if (error.message.includes('Invalid invite code')) {
      throw new Error('Invalid invite code. Please check and try again.');
    }
    throw new Error(error.message || 'An unknown error occurred.');
  }
};