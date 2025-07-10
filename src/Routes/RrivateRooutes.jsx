import React from 'react';
import useAuth from '../Hooks/useAuth';
import Spinner from '../Shared/Spinner';
import { Navigate } from 'react-router';

const RrivateRooutes = ({children }) => {

    const {user, loading} = useAuth()

    if(loading){
        <Spinner></Spinner>

    }

    if(!user){
        <Navigate to="/login"></Navigate>
    }

    return children
};

export default RrivateRooutes;