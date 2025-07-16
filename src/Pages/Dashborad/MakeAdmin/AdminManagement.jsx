import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { FaSearch, FaUserShield, FaUserTimes, FaUser, FaUserCog } from 'react-icons/fa';
import Spinner from '../../../Shared/Spinner';

const AdminManagement = () => {
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-users', debouncedSearch, roleFilter],
        queryFn: async () => {
            const res = await axiosSecure.get(`/admin/users/search?email=${debouncedSearch}&role=${roleFilter}`);
            return res.data.data;
        }
    });

    const makeAdmin = async (userId) => {
        Swal.fire({
            title: 'Make Admin?',
            text: 'Are you sure you want to make this user an admin?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, make admin'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.put(`/admin/users/${userId}/make-admin`);
                    Swal.fire('Success!', 'User is now an admin.', 'success');
                    refetch();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', error.response?.data?.message || 'Failed to make admin', 'error');
                }
            }
        });
    };

    const removeAdmin = async (userId) => {
        Swal.fire({
            title: 'Remove Admin?',
            text: 'Are you sure you want to remove admin privileges from this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove admin'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.put(`/admin/users/${userId}/remove-admin`);
                    Swal.fire('Success!', 'Admin privileges removed.', 'success');
                    refetch();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', error.response?.data?.message || 'Failed to remove admin', 'error');
                }
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">Admin Management</h2>
                
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by email..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="select select-bordered w-full md:w-auto"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="rider">Riders</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.email}</td>
                                    <td>{user.name || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${
                                            user.role === 'admin' ? 'badge-primary' :
                                            user.role === 'rider' ? 'badge-secondary' :
                                            'badge-ghost'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.createdAt || user.created_at)}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            {user.role !== 'admin' ? (
                                                <button
                                                    onClick={() => makeAdmin(user._id)}
                                                    className="btn btn-sm btn-primary"
                                                    title="Make Admin"
                                                >
                                                   Make Admin <FaUserShield />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => removeAdmin(user._id)}
                                                    className="btn btn-sm btn-error"
                                                    title="Remove Admin"
                                                >
                                                    Remove admin<FaUserTimes />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-8">
                        <FaUserCog className="mx-auto text-4xl text-gray-400 mb-2" />
                        <p className="text-gray-500">No users found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManagement;