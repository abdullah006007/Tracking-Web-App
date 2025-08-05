import axios from "axios";

const axiosInstance = axios.create({
    baseURL : `https://tracking-server-side.vercel.app`
})

const useAxios = () => {
    return axiosInstance
};

export default useAxios;