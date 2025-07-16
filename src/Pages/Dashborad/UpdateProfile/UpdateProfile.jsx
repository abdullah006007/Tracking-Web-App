import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import axios from 'axios';

const UpdateProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [profilePic, setProfilePic] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosSecure.get(`/users/${user?.email}`);
                if (response.data.success) {
                    setProfilePic(response.data.data.photoURL || '');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user, axiosSecure]);

    const handleImageUpload = async (e) => {
        const image = e.target.files[0];
        if (!image) return;

        setImageUploading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const res = await axios.post(
                `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_UPLOAD_IMBB}`,
                formData
            );
            setProfilePic(res.data.data.url);
        } catch (error) {
            console.error('Image upload error:', error);
            Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
            setImageUploading(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Update Firebase authentication profile
            if (data.name !== user.displayName || profilePic !== user.photoURL) {
                await updateUserProfile({
                    displayName: data.name,
                    photoURL: profilePic
                });
            }

            // Update user data in MongoDB
            const response = await axiosSecure.put('/users/update', {
                email: user.email,
                updates: {
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    photoURL: profilePic
                }
            });

            if (response.data.success) {
                Swal.fire('Success!', 'Profile updated successfully', 'success');
            } else {
                Swal.fire('Error', response.data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            Swal.fire(
                'Error',
                error.response?.data?.message || error.message || 'Failed to update profile',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Update Profile</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <img 
                            src={profilePic || '/default-avatar.png'} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={imageUploading}
                            />
                            {imageUploading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            )}
                        </label>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        defaultValue={user?.displayName || ''}
                        {...register('name', { required: true })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">Name is required</p>
                    )}
                </div>

                {/* Email (read-only) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        defaultValue={user?.email || ''}
                        readOnly
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+880XXXXXXXXXX"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                        {...register('address')}
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || imageUploading}
                        className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ${
                            loading || imageUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {(loading || imageUploading) ? (
                            <span className="flex items-center justify-center">
                                <span className="loading loading-spinner loading-sm mr-2"></span>
                                {loading ? 'Updating...' : 'Uploading Image...'}
                            </span>
                        ) : (
                            'Update Profile'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfile;