import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../Shared/Navbar';
import Footer from '../Shared/Footer/Footer';
import GoogleAnalytics from '../Utilities/GoogleAnalytics';

const RootLayOut = () => {
    return (
        <div>

            <GoogleAnalytics></GoogleAnalytics>
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default RootLayOut;