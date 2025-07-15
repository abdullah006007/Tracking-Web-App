import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  updateProfile
} from 'firebase/auth';
import { auth } from '../../Firebase/firebase.init';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user with email and password
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with email and password
  const signIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signinWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };
  

  // 
  const updateUserProfile = profileInfo =>{
    return updateProfile(auth.currentUser, profileInfo)
  }



  // Sign out
  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  // Listen to auth state changes
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, mainUser => {
      setUser(mainUser);
      console.log('User in auth change:', mainUser);
      setLoading(false);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  const authInfo = {
    createUser,
    signIn,
    signinWithGoogle,
    logOut,
    user,
    loading,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
