import { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const EMPTY = { name: '', email: '', password: '' }

export default function AdminSuperAdmins() {
  const { user }                  = useAuth()
  const [list, setList]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [showPass, setShowPass]   = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getSuperAdmins()
      .then(r => setList(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.createSuperAdmin(form)
      toast.success(`Super Admin "${form.name}" created!`)
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (u) => {
    if (u.email === user.email) {
      toast.error("You cannot deactivate your own account!")
      return
    }
    const next = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const action = next === 'ACTIVE' ? 'activate' : 'deactivate'
    if (!confirm(`Are you sure you want to ${action} "${u.name}"?`)) return
    try {
      await adminAPI.updateSuperAdminStatus(u.id, next)
      toast.success(`${u.name} ${next.toLowerCase()}d`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Super Admins</h1>
          <p className="text-sm text-gray-400 mt-1">
            {list.length} platform administrator{list.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Super Admin
        </button>
      </div>

      {/* Warning banner */}
      <div className="mb-5 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
        <p className="text-xs text-amber-700 leading-relaxed">
          Super Admins have full platform access — they can manage all doctors,
          receptionists and other super admins. Only create accounts for trusted people.
        </p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Name', 'Email', 'Status', 'Created', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.name}</div>
                    {u.email === user.email && (
                      <span className="text-xs text-teal-500 font-medium">You</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {u.email !== user.email ? (
                      <button
                        className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-danger' : ''}`}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Current session</span>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No super admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <Modal title="Add New Super Admin" onClose={() => { setShowModal(false); setForm(EMPTY) }}>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              This person will have <strong>full platform access</strong> — including managing doctors and other admins.
            </p>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input" required placeholder="Full name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email" className="input" required
                placeholder="email@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-16" required
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button" className="btn"
                onClick={() => { setShowModal(false); setForm(EMPTY) }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Creating...' : 'Create Super Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}