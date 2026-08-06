import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
 baseURL: API_BASE_URL,
 headers: {
   'Content-Type': 'application/json',
   'X-CricIntel-Client': 'SPA',
 },
 timeout: 30000,
});

apiClient.interceptors.request.use(
 (config) => {
   const token = localStorage.getItem('access_token');
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 },
 (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
 (response) => response,
 (error) => {
   console.error('API Error:', error.response?.data || error.message);
   return Promise.reject(error);
 },
);


export default apiClient;
