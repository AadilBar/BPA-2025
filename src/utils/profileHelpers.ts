import { auth, db } from '../firebase/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { decryptData, decryptArray } from './encryption';

/**
 * Check if the current user has completed their profile setup
 * Returns true if profile is complete, false otherwise
 */
export const checkProfileSetupComplete = async (): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      console.log('No current user');
      return false;
    }

    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No profile found for user');
      return false;
    }

    const isComplete = querySnapshot.docs[0].data().setupCompleted === true;
    console.log('Profile setup complete:', isComplete);
    return isComplete;
  } catch (error: any) {
    console.error('Error checking profile setup:', error);
    // If permission denied, assume setup not complete
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when checking profile - update your Firestore rules');
      return false;
    }
    return false;
  }
};

/**
 * Get the current user's profile data from Firestore
 */
/**
 * Get the current user's profile data from Firestore
 * Automatically decrypts sensitive fields
 */
export const getUserProfile = async () => {
  try {
    if (!auth.currentUser) {
      console.log('No current user');
      return null;
    }

    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No profile found');
      return null;
    }

    const data = querySnapshot.docs[0].data();
    const encryptionKey = auth.currentUser.uid;

    console.log('Decrypting sensitive user data');

    // Decrypt sensitive fields
    const decryptedProfile = {
      docId: querySnapshot.docs[0].id,
      ...data,
      // Decrypt sensitive fields
      phone: data.phone ? decryptData(data.phone, encryptionKey) : null,
      age: data.age ? decryptData(data.age, encryptionKey) : null,
      triggers: data.triggers && Array.isArray(data.triggers)
        ? decryptArray(data.triggers, encryptionKey)
        : []
    };

    console.log('Profile data decrypted successfully');
    return decryptedProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Mark user's setup as incomplete (requires them to complete setup on next login)
 */
export const markSetupIncomplete = async (): Promise<boolean> => {
  try {
    if (!auth.currentUser) {
      return false;
    }

    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false;
    }

    await updateDoc(querySnapshot.docs[0].ref, {
      setupCompleted: false,
      updatedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error marking setup incomplete:', error);
    return false;
  }
};
