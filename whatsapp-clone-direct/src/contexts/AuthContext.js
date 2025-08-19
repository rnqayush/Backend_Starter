import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase/config';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              ...user,
              ...userDoc.data()
            });
          } else {
            setCurrentUser(user);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // Register a new user
  const register = async (email, password, name) => {
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        status: 'Available',
        lastSeen: new Date().toISOString(),
        contacts: [],
        settings: {
          theme: 'light',
          notifications: true,
          sound: true,
          privacy: {
            lastSeen: 'everyone',
            profilePhoto: 'everyone',
            about: 'everyone',
            readReceipts: true
          }
        }
      });
      
      // Send email verification
      await sendEmailVerification(user);
      
      return user;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Login with email and password
  const login = async (email, password) => {
    setError('');
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last seen
      await updateDoc(doc(db, 'users', user.uid), {
        lastSeen: new Date().toISOString(),
        isOnline: true
      });
      
      return user;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Login with Google
  const loginWithGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          status: 'Available',
          lastSeen: new Date().toISOString(),
          contacts: [],
          settings: {
            theme: 'light',
            notifications: true,
            sound: true,
            privacy: {
              lastSeen: 'everyone',
              profilePhoto: 'everyone',
              about: 'everyone',
              readReceipts: true
            }
          }
        });
      } else {
        // Update last seen
        await updateDoc(doc(db, 'users', user.uid), {
          lastSeen: new Date().toISOString(),
          isOnline: true
        });
      }
      
      return user;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Logout
  const logout = async () => {
    setError('');
    try {
      // Update last seen and online status
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          lastSeen: new Date().toISOString(),
          isOnline: false
        });
      }
      
      await signOut(auth);
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (data) => {
    setError('');
    try {
      const { displayName, photoFile, status } = data;
      const updates = {};
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(auth.currentUser, { displayName });
        updates.displayName = displayName;
      }
      
      // Upload photo if provided
      if (photoFile) {
        const photoRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
        await uploadBytes(photoRef, photoFile);
        const photoURL = await getDownloadURL(photoRef);
        
        await updateProfile(auth.currentUser, { photoURL });
        updates.photoURL = photoURL;
      }
      
      // Update status if provided
      if (status) {
        updates.status = status;
      }
      
      // Update Firestore document
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      }
      
      // Update current user state
      setCurrentUser(prev => ({
        ...prev,
        ...updates
      }));
      
      return true;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Update user email
  const updateUserEmail = async (newEmail, password) => {
    setError('');
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email
      await updateEmail(auth.currentUser, newEmail);
      
      // Update Firestore document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        email: newEmail
      });
      
      // Update current user state
      setCurrentUser(prev => ({
        ...prev,
        email: newEmail
      }));
      
      return true;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Update user password
  const updateUserPassword = async (currentPassword, newPassword) => {
    setError('');
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      return true;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Update user settings
  const updateUserSettings = async (settings) => {
    setError('');
    try {
      // Update Firestore document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        settings
      });
      
      // Update current user state
      setCurrentUser(prev => ({
        ...prev,
        settings
      }));
      
      return true;
    } catch (err) {
      setError(handleAuthError(err));
      throw err;
    }
  };
  
  // Handle Firebase auth errors
  const handleAuthError = (error) => {
    console.error('Auth error:', error);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email is already in use. Please use a different email or login.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing the sign in.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log in again.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };
  
  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserSettings
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

