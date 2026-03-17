import { createContext, useContext, useState, useEffect, useRef } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const initialized           = useRef(false)

  useEffect(() => {
    // Run only ONCE — prevent multiple re-renders
    if (initialized.current) return
    initialized.current = true

    const token  = localStorage.getItem('token')
    const stored = localStorage.getItem('user')

    if (token && stored) {
      try {
        const parsedUser = JSON.parse(stored)
        // Set token in axios before setting user
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(parsedUser)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    const { token, ...userInfo } = data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userInfo))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userInfo)
    return userInfo
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)