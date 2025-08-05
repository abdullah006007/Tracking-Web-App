import React from 'react';
import useAuth from '../Hooks/useAuth';
import useUserRole from '../Hooks/useUserRole';
import Spinner from '../Shared/Spinner';

const RiderRoute = ({children}) => {

    const {user, loading} = useAuth()
    const {role, roleLoading} = useUserRole()

    if(loading || roleLoading){
        return <Spinner></Spinner>
    }

    if(!user || role !== 'rider'){
        return <Navigate state={{ from :location.pathname}} to="/forbidden"></Navigate>
    }


    return children;


};

export default RiderRoute;