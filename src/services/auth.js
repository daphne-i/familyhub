import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Signs in a user with email and password.
 */
export const signIn = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign In Error:', error);
    // Convert Firebase error codes to user-friendly messages
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('That email address is invalid.');
    }
    throw new Error('Sign in failed. Please try again.');
  }
};

/**
 * Signs up a new user and creates their user document.
 */
export const signUp = async (displayName, email, password) => {
  if (!displayName || !email || !password) {
    throw new Error('Display name, email, and password are required.');
  }
  try {
    // 1. Create the user in Firebase Auth
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // 2. Update their auth profile with their display name
    await user.updateProfile({ displayName });

    // 3. Create their user document in Firestore (as per Section 9.0)
    // The onUserCreate cloud function is the *primary* way, but
    // creating it client-side gives a faster UI experience.
    // The cloud function can act as a backup.
    await firestore().collection('users').doc(user.uid).set({
      email: user.email,
      displayName: displayName,
      familyId: null, // User starts with no family
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return user;
  } catch (error) {
    console.error('Sign Up Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('That email address is already in use!');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('That email address is invalid.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    }
    throw new Error('Sign up failed. Please try again.');
  }
};

/**
 * Signs out the current user.
 */
export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw new Error('Sign out failed.');
  }
};