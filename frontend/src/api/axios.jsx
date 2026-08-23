import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000', // L'adresse ta3 FastAPI ta3k
});

// Zid l'Token automatic fel headers ila kan mawjoud f localStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;