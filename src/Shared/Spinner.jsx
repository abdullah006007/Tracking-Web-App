import React from 'react';

const Spinner = () => {
    return (
        <div>
            <div className="flex justify-center items-center py-5 hidden ">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-green-500"></div>
            </div>

        </div>
    );
};

export default Spinner;