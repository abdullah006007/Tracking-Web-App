import React from 'react';

const Spinner = () => {
    return (
        <div className='flex justify-center items-center my-64'>
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-green-500"></div>
            
        </div>
    );
};

export default Spinner;