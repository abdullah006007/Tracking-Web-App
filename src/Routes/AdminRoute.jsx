import React, { Children } from 'react';
import useAuth from '../Hooks/useAuth';
import Spinner from '../Shared/Spinner';
import useUserRole from '../Hooks/useUserRole';
import { Navigate } from 'react-router';

const AdminRoute = ({children}) => {


    const {user, loading} = useAuth()
    const {role, roleLoading} = useUserRole()

    if(loading || roleLoading){
        return <Spinner></Spinner>
    }

    if(!user || role !== 'admin'){
        return <Navigate state={{ from :location.pathname}} to="/forbidden"></Navigate>
    }


    return children;
};

export default AdminRoute;