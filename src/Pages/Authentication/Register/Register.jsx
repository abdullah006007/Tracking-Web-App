import React from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../Hooks/useAuth';
import { Link } from 'react-router';
import Sociallogin from '../SocialLogin/Sociallogin';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()

    const { createUser } = useAuth()



    const onSubmit = data => {
        console.log(data);
        createUser(data.email, data.password)
            .then(result => {
                console.log(result.user);
            })

            .catch(error => {
                console.log(error);
            })

    }


    return (
        <div>

            <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                <div className="card-body">
                    <h1 className="text-5xl font-bold">Create Account</h1>

                    <form onSubmit={handleSubmit(onSubmit)}>

                        <fieldset className="fieldset">


                            <label className="label">Email</label>
                            <input type="email" {...register('email', { required: true })} className="input" placeholder="Email" />
                            {
                                errors.email?.type === 'required' && <p className='text-red-500'> Email is required </p>
                            }


                            <label className="label">Password</label>
                            <input type="password" {...register('password', { required: true, minLength: 6 })} className="input" placeholder="Password" />
                            {
                                errors.password?.type === 'required' && <p className='text-red-500'> Password Required  </p>
                            }
                            {
                                errors.password?.type === 'minLength' && <p className='text-red-500'> Password must be six Character or longer  </p>
                            }


                            <div><a className="link link-hover">Forgot password?</a></div>
                            <button className="btn btn-primary text-black mt-4">Register</button>

                        </fieldset>

                        <p><small>Already have and Account? <Link className='text-blue-400 underline' to="/login">
                        Login</Link> </small></p>
                    </form>


                    <Sociallogin></Sociallogin>







                </div>
            </div>

        </div>
    );
};

export default Register;