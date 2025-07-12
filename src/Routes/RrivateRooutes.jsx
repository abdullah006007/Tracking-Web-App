import React, { useEffect, useRef } from 'react';
import useAuth from '../Hooks/useAuth';
import Spinner from '../Shared/Spinner';
import { Navigate, useLocation } from 'react-router';
import toast from 'react-hot-toast';

const RrivateRooutes = ({ children }) => {
    const hasShownToast = useRef(false);


    const { user, loading } = useAuth()

    const location = useLocation()
    const [shouldRedirect, setShouldRedirect] = React.useState(false);

    useEffect(() => {
        if (!loading && !user && !hasShownToast.current) {
            toast.error('Please log in to access this page');
            hasShownToast.current = true;
            setShouldRedirect(true);
        }
    }, [loading, user, location]);




    if (loading) {
        <Spinner></Spinner>

    }


    if (user?.email) {
        return children;
    }

    if (shouldRedirect) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return null;





};

export default RrivateRooutes;