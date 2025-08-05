// src/Hooks/useAxiosPublic.js
import axios from 'axios';

const axiosPublic = axios.create({
    baseURL: `https://tracking-server-side.vercel.app`
});

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;