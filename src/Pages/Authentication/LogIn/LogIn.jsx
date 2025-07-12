import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import Sociallogin from '../SocialLogin/Sociallogin';
import useAuth from '../../../Hooks/useAuth';
import Swal from 'sweetalert2';

const LogIn = () => {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const { signIn } = useAuth()
    
    const location = useLocation()
    const from = location.state?.from || '/'
    const navigate = useNavigate();
   

    const onSubmit = data => {

        signIn(data.email, data.password)
            .then(result => {
                if (result.user) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Log in successfully',
                        text: 'Log in successfully!',
                    });
                    navigate(from);
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            });

    }


    return (
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
            <div className="card-body">
                <h1 className="text-5xl font-bold">Please Login</h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <fieldset className="fieldset">

                        <label className="label">Email</label>
                        <input type="email" className="input" {...register('email')} placeholder="Email" />

                        <label className="label">Password</label>
                        <input type="password" className="input" {...register('password', { required: true, minLength: 6 })} placeholder="Password" />
                        {
                            errors.password?.type === 'required' && <p className='text-red-400 '> Password is Required </p>
                        }
                        {
                            errors.password?.type === 'minLength' && <p className='text-red-400'> Password must be six Character  </p>
                        }


                        <div><a className="link link-hover">Forgot password?</a></div>



                        <button className="btn btn-primary text-black mt-4">Login</button>

                        <p><small>New to this website?<Link className='text-blue-400 underline' to="/register">
                            Register</Link> </small></p>





                    </fieldset>
                    <Sociallogin from={from}></Sociallogin>

                </form>

            </div>
        </div>
    );
};

export default LogIn;