import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../../Firebase/firebase.init';



const googleProvider = new GoogleAuthProvider () 

const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)


    // password authentication in google (1)

    const createUser = (email, password)=>{
        setLoading(true)
        return createUserWithEmailAndPassword(auth, email, password )

    }

    // password authentication in google (2)
    const signIn = (email, password) =>{
        setLoading(true) 
        return signInWithEmailAndPassword(auth, email, password)
    }


    // creating google button
    const signinWithGoogle = ()=>{
        setLoading(true)
        return signInWithPopup(auth, googleProvider)
    }


    // Signout (4) in password authentication
    const logOut = ()=>{
        setLoading(true)
        return signOut(auth)
    }


    // manage user in google (3)
    useEffect(()=>{
        const unSubscribe = onAuthStateChanged(auth, currentUser=>{
            setUser(currentUser)
            console.log('user in auth change ', currentUser);
            setLoading(false)
        })

        return ()=>{
            unSubscribe()
        }
        
    },[])



    const authInfo ={
        createUser,
        signIn,
        user,
        loading,
        logOut,
        signinWithGoogle

    }


    return (
        <AuthContext value={authInfo}>
            {children}        
        </AuthContext>
    );
};

export default AuthProvider;