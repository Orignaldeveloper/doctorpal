import { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const EMPTY = { name: '', email: '', password: '', phoneNumber: '' }

export default function DoctorReceptionists() {
  const [list, setList]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)

  const load = () => {
    doctorAPI.getReceptionists()
      .then(r => setList(r.data.data || []))
      .catch(() => toast.error('Failed to load receptionists'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await doctorAPI.createReceptionist(form)
      toast.success('Receptionist account created')
      setShowModal(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (userId) => {
    try {
      await doctorAPI.toggleReceptionist(userId)
      toast.success('Status updated')
      load()
    } catch { toast.error('Update failed') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Receptionists</h1>
          <p className="text-sm text-gray-400 mt-1">Manage front-desk staff for your clinic</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Receptionist</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Name','Email','Status','Joined','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${r.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={`btn btn-sm ${r.status === 'ACTIVE' ? 'btn-danger' : ''}`}
                      onClick={() => toggle(r.id)}
                    >
                      {r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No receptionists yet.
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Add Receptionist" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {[
              ['name','Full Name','text'],
              ['email','Email','email'],
              ['password','Password','password'],
              ['phoneNumber','Phone Number','text'],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="label">{label} *</label>
                <input type={type} className="input" required
                  value={form[key]} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
