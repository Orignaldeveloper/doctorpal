import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'SUPER_ADMIN') navigate('/admin')
      else if (user.role === 'DOCTOR') navigate('/doctor')
      else navigate('/receptionist')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-gray-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-teal-600 mb-1">DoctorPal</h1>
          <p className="text-sm text-gray-500">Clinic Queue & Patient Management</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display text-xl mb-6 text-gray-800">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@clinic.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-xs text-teal-700 text-center font-medium mb-1">Contact : 7875573029/8766425371</p>
            <p className="text-xs text-yellow-500 text-center font Bold">BIJODE & SON'S PRODUCT</p>
          </div>
        </div>
      </div>
    </div>
  )
}
