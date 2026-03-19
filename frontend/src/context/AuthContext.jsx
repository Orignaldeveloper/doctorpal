import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token  = localStorage.getItem('token')
    const stored = localStorage.getItem('user')

    if (token && stored) {
      try {
        const parsedUser = JSON.parse(stored)
        // Only store essential fields — never trust extra fields
        const safeUser = {
          email:    parsedUser.email,
          name:     parsedUser.name,
          role:     parsedUser.role,
          doctorId: parsedUser.doctorId,
        }
        setUser(safeUser)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
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

    // Only save essential fields to localStorage
    const safeUser = {
      email:    userInfo.email,
      name:     userInfo.name,
      role:     userInfo.role,
      doctorId: userInfo.doctorId,
    }

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(safeUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(safeUser)
    return safeUser
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