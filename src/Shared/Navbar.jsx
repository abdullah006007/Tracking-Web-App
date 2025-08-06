import React, { useState } from 'react';
import { Link, NavLink } from 'react-router';
import Profastlogo from './ProfastLogo/Profastlogo';
import useAuth from '../Hooks/useAuth';
import Swal from 'sweetalert2';

const Navbar = () => {
    const { user, logOut } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSignOut = () => {
        logOut()
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Log Out Successful',
                    text: 'Log Out Successful!'
                });
                setShowDropdown(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    const navItems = <>
        <li className='font-bold'> <NavLink to="/">HOME</NavLink> </li>
        {/* <li className='font-bold'> <NavLink to="/sendparcel">SEND PARCEL</NavLink> </li> */}
        <li className='font-bold'> <NavLink to="/coverage">COVERAGE</NavLink> </li>
        {user && <li className='font-bold'> <NavLink to="/dashboard">DASHBOARD</NavLink> </li>}
        <li className='font-bold'> <NavLink to="track-parcel">TRACK PARCEL</NavLink> </li>
        <li className='font-bold'> <NavLink to="/beComeRider">BE A RIDER</NavLink> </li>
        <li className='font-bold'> <NavLink to="/about">ABOUT US</NavLink> </li>
    </>

    return (
        <div>
            <div className="navbar bg-base-100">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            {navItems}
                        </ul>
                    </div>
                    <Profastlogo></Profastlogo>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {navItems}
                    </ul>
                </div>
                <div className="navbar-end">
                    <div>
                        {user ? (
                            <div className='flex gap-5 items-center'>
                                <button onClick={handleSignOut} className='btn btn-primary text-black'>Log Out</button>
                                
                                <div className="relative">
                                    <div 
                                        className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-gray-300"
                                        onClick={toggleDropdown}
                                    >
                                        <img
                                            src={user?.photoURL || 'https://cdn-icons-png.flaticon.com/512/4042/4042356.png'}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                            <Link 
                                                to="/dashboard/update-profile" 
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Update Profile
                                            </Link>
                                            <Link 
                                                to="/dashboard" 
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="login" className="btn btn-primary text-black">Log in</Link>
                                <Link to="register" className="btn btn-primary text-black">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;