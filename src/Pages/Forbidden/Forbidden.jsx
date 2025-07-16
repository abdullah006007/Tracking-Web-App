import React from 'react';
import { Link } from 'react-router';

const Forbidden = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full text-center">
                <div className="text-6xl font-bold text-red-500">403</div>
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">Access Forbidden</h2>
                <p className="text-gray-600 mt-2">
                    Sorry, you don’t have permission to view this page.
                </p>
                <Link
                    to="/"
                    className="inline-block mt-6 px-6 py-2 bg-red-500 text-black rounded-lg hover:bg-red-600 transition duration-300"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default Forbidden;
