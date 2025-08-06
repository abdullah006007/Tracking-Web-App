import React from 'react';
import { Link, Navigate, NavLink, Outlet } from 'react-router';
import Profastlogo from '../Shared/ProfastLogo/Profastlogo';
import { FaBoxOpen, FaMoneyCheckAlt, FaUserEdit, FaSearchLocation, FaMotorcycle, FaUserClock, FaTasks } from 'react-icons/fa';
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr";
import { AiFillHome } from 'react-icons/ai';
import useUserRole from '../Hooks/useUserRole';
import { IoGiftOutline } from "react-icons/io5";


const DashboardLayout = () => {


    const { role, roleLoading } = useUserRole()
    console.log(role);

    if (location.pathname === '/dashboard') {
        return <Navigate to="/dashboard/home" replace />;
    }



    return (
        <div className="min-h-screen">
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    {/* Mobile Navbar */}
                    <div className="navbar bg-base-300 w-full lg:hidden">
                        <div className="flex-none">
                            <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="inline-block h-6 w-6 stroke-current"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    ></path>
                                </svg>
                            </label>
                        </div>
                        <div className="flex-1 px-2 font-semibold">Dashboard</div>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 p-4">
                        <Outlet />
                    </main>
                </div>

                {/* Sidebar */}
                <div className="drawer-side">
                    <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="menu bg-base-200 text-base-content w-80 p-4 space-y-2">
                        {/* Logo */}
                        <div className="mb-4">
                            <Profastlogo />
                        </div>

                        {/* Navigation Links */}
                        <NavLink
                            to="/dashboard/home"
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                            }
                        >
                            <AiFillHome className="text-lg" />
                            <span>Home</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/myParcels"
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                            }
                        >
                            <FaBoxOpen className="text-lg" />
                            <span>My Parcels</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/paymentHistory"
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                            }
                        >
                            <FaMoneyCheckAlt className="text-lg" />
                            <span>Payment History</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/track"
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                            }
                        >
                            <FaSearchLocation className="text-lg" />
                            <span>Track a Package</span>
                        </NavLink>

                        <NavLink
                            to="/dashboard/update-profile"
                            className={({ isActive }) =>
                                `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                            }
                        >
                            <FaUserEdit className="text-lg" />
                            <span>Update Profile</span>
                        </NavLink>





                        {!roleLoading && (role === 'rider') && (
                            // || role === 'admin'
                            <>
                                <NavLink
                                    to="/dashboard/pending-deliveries"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'
                                        }`
                                    }
                                >
                                    <FaTasks className="text-lg" />
                                    <span>Pending Deliveries</span>
                                </NavLink>
                            </>
                        )}



                        {/* Admin only role */}

                        {!roleLoading && role === 'admin' &&


                            <>

                                <NavLink
                                    to="/dashboard/send-parcel"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                                    }
                                >
                                    <IoGiftOutline className="text-lg" />
                                    <span>Send Parcel</span>
                                </NavLink>


                                <NavLink
                                    to="/dashboard/assign-rider"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                                    }
                                >
                                    <MdOutlineAssignmentTurnedIn className="text-lg" />
                                    <span>Assign Rider</span>
                                </NavLink>



                                <NavLink
                                    to="/dashboard/activeRiders"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                                    }
                                >
                                    <FaMotorcycle className="text-lg" />
                                    <span>Active Riders</span>
                                </NavLink>

                                <NavLink
                                    to="/dashboard/pendingRiders"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                                    }
                                >
                                    <FaUserClock className="text-lg" />
                                    <span>Pending Riders</span>
                                </NavLink>

                                <NavLink
                                    to="/dashboard/AdminManagement"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'hover:bg-base-300'}`
                                    }
                                >
                                    <GrUserAdmin className="text-lg" />
                                    <span>Admin Management</span>
                                </NavLink>



                            </>
                        }





                        {/* Back to Main Site */}
                        <div className="pt-4 mt-4 border-t border-base-300">
                            <Link to="/" className="btn btn-ghost w-full justify-start">
                                ← Back to Main Site
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;