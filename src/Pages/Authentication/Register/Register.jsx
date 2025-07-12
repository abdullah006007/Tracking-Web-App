import React from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../Hooks/useAuth';
import { Link} from 'react-router'; // ✅ fixed import
import Sociallogin from '../SocialLogin/Sociallogin';
import Swal from 'sweetalert2';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { createUser } = useAuth();

    const onSubmit = data => {
        createUser(data.email, data.password)
            .then(result => {
                if (result.user) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Account Created',
                        text: 'User registered successfully!',
                    });
                   
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="card bg-base-100 w-full max-w-sm shadow-2xl">
                <div className="card-body">
                    <h1 className="text-3xl font-bold text-center mb-4">Create Account</h1>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <fieldset className="fieldset">
                            {/* Email Field */}
                            <label className="label">Email</label>
                            <input
                                type="email"
                                {...register('email', { required: true })}
                                className="input input-bordered w-full"
                                placeholder="Email"
                            />
                            {errors.email && (
                                <p className='text-red-500 text-sm mt-1'>Email is required</p>
                            )}

                            {/* Password Field */}
                            <label className="label mt-2">Password</label>
                            <input
                                type="password"
                                {...register('password', { required: true, minLength: 6 })}
                                className="input input-bordered w-full"
                                placeholder="Password"
                            />
                            {errors.password?.type === 'required' && (
                                <p className='text-red-500 text-sm mt-1'>Password is required</p>
                            )}
                            {errors.password?.type === 'minLength' && (
                                <p className='text-red-500 text-sm mt-1'>
                                    Password must be at least 6 characters
                                </p>
                            )}

                            {/* Forgot Password */}
                            <div className="mt-2">
                                <a className="link link-hover text-sm text-blue-600" href="#">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button className="btn btn-primary w-full mt-4" type="submit">
                                Register
                            </button>
                        </fieldset>

                        {/* Redirect to Login */}
                        <p className="mt-4 text-sm text-center">
                            Already have an account?
                            <Link className='text-blue-500 underline ml-1' to="/login">Login</Link>
                        </p>
                    </form>

                    {/* Social Login */}
                    <div className="mt-4">
                        <Sociallogin />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
