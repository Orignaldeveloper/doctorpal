import axios from 'axios'

// Detect which backend to use based on current URL
const getBaseURL = () => {
  const hostname = window.location.hostname

  // Local development
  if (hostname === 'localhost') {
    return '/api'
  }

  // Dev environment
  if (hostname.includes('dev')) {
    return 'https://doctorpal-backend-dev.onrender.com/api'
  }

  // Prod environment
  return 'https://doctorpal-backend-prod.onrender.com/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api