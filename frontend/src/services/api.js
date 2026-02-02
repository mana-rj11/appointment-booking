import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur : ajouter le token automatiqement
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// intercepteur : gérer token expiré
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;