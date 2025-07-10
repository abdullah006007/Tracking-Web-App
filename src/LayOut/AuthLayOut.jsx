import React from 'react';
import { Outlet } from 'react-router';
import images from ".././assets/authImage.png"
import Profastlogo from '../Shared/ProfastLogo/Profastlogo';

const AuthLayOut = () => {
    return (
        <div>
            <div>
                <Profastlogo></Profastlogo>
            </div>
            <div className=" p-12 bg-base-200 ">
                <div className="hero-content flex-col lg:flex-row-reverse">


                    <div className='flex-1'>
                        <img
                            src={images}
                            className="max-w-sm rounded-lg "
                        />
                    </div>



                    <div className='flex-1'>
                        <Outlet></Outlet>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthLayOut;