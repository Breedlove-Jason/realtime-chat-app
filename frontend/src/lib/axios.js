import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL:"http://localhost:5006/api",
    withCredentials: true,
})