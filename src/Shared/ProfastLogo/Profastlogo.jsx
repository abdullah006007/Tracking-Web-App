import React from 'react';
import logo from "../../assets/logo2.png"
import { Link } from 'react-router';

const Profastlogo = () => {
    return (
        <Link to="/">
            <div>
                <img className='w-36' src={logo} alt="" />

            </div>
        </Link>
    );
};

export default Profastlogo;