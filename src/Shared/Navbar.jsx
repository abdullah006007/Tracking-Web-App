import React from 'react';
import { Link, NavLink } from 'react-router';
import Profastlogo from './ProfastLogo/Profastlogo';
import useAuth from '../Hooks/useAuth';
import Swal from 'sweetalert2';

const Navbar = () => {

    const { user, logOut } = useAuth()
    console.log();



    const handleSignOut = () => {
        logOut()
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Log Out Successful',
                    text: 'Log Out Successful!'
                });
            })
            .catch((error) => {
                console.log(error);
            });

    }



    const navItems = <>

        <li> <NavLink to="/">HOME</NavLink> </li>
        <li> <NavLink to="/sendparcel">SEND PERCEL</NavLink> </li>
        <li> <NavLink to="/coverage">COVERAGE</NavLink> </li>

        {
            user && <>
            <li> <NavLink to="/dashboard">DASHBOARD</NavLink> </li>

            </>
        }


        <li> <NavLink to="/">ABOUT US</NavLink> </li>


    </>


    return (
        <div>
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
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
                        {
                            user ? (

                                <div className='flex gap-5 items-center '>

                                    <button onClick={handleSignOut} className='btn btn-primary text-black'>Log Out</button>




                                    <div className="relative group w-10 h-10  ">
                                        <img
                                            // src={providerData?.photoURL || 'https://cdn-icons-png.flaticon.com/512/4042/4042356.png'}
                                            alt="User"
                                            className="w-ful  h-full object-cover cursor-pointer rounded-full"
                                        />

                                        {/* Tooltip */}
                                        <div className="absolute  right-full  top-16 -translate-y-1/2  bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                                            {/* <p>{providerData?.displayName || 'No Name'}</p>
                                            <p>{providerData?.email || 'No Email'}</p> */}
                                        </div>
                                    </div>




                                </div>


                            ) : (

                                <div className="flex gap-2">
                                    <Link to="login" className="btn btn-primary text-black">Log in</Link>
                                    <Link to="register" className="btn btn-primary text-black">Register</Link>
                                </div>

                            )

                        }
                    </div>



                </div>
            </div>

        </div>
    );
};

export default Navbar;