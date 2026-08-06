import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
 headers: {
 'Content-Type': 'application/json',
 'X-CricIntel-Client': 'SPA'
 },
 withCredentials: false
})

// Request Interceptor
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('access_token')
 if (token) {
 config.headers.Authorization = `Bearer ${token}`
 }
 return config
 },
 (error) => Promise.reject(error)
)

// Response Interceptor for Token Refresh
api.interceptors.response.use(
 (response) => response,
 async (error) => {
  const originalRequest = error.config
  
  // Do not intercept 401s for login requests
  if (originalRequest.url.includes('/auth/login/')) {
    return Promise.reject(error)
  }

  if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true
  
  try {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
  refresh: refreshToken
  })

  localStorage.setItem('access_token', data.access)
  originalRequest.headers.Authorization = `Bearer ${data.access}`
  return api(originalRequest)
  } catch (refreshError) {
  // Only logout on actual refresh failure, not on random errors
  useAuthStore.getState().logout()
  window.location.href = '/login'
  return Promise.reject(refreshError)
  }
  }
  
  return Promise.reject(error)
 }
)

export default api
