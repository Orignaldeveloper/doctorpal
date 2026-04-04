import { useEffect, useState } from 'react'
import { ipdAPI } from '../../../api/services'
import Modal from '../../../components/common/Modal'
import toast from 'react-hot-toast'

const EMPTY    = { bedNumber: '', bedType: 'General', ratePerDay: '' }
const BED_TYPES = ['General', 'Semi-Private', 'Private', 'ICU', 'HDU']

const statusStyle = {
  AVAILABLE:   { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700',  dot: 'bg-green-400'  },
  OCCUPIED:    { bg: 'bg-teal-50',   border: 'border-teal-200',  text: 'text-teal-700',   dot: 'bg-teal-400'   },
  MAINTENANCE: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700',  dot: 'bg-amber-400'  },
}

export default function BedManagement() {
  const [beds, setBeds]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBed, setEditBed]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)

  const load = () => {
    ipdAPI.getBeds()
      .then(r => setBeds(r.data.data || []))
      .catch(() => toast.error('Failed to load beds'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd  = () => { setForm(EMPTY); setEditBed(null); setShowModal(true) }
  const openEdit = (b) => {
    setForm({ bedNumber: b.bedNumber, bedType: b.bedType, ratePerDay: b.ratePerDay })
    setEditBed(b); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editBed ? await ipdAPI.updateBed(editBed.id, form) : await ipdAPI.createBed(form)
      toast.success(editBed ? 'Bed updated!' : 'Bed added!')
      setShowModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const updateStatus = async (bedId, status) => {
    try {
      await ipdAPI.updateBedStatus(bedId, status)
      toast.success('Bed status updated')
      load()
    } catch { toast.error('Failed') }
  }

  const available   = beds.filter(b => b.status === 'AVAILABLE').length
  const occupied    = beds.filter(b => b.status === 'OCCUPIED').length
  const maintenance = beds.filter(b => b.status === 'MAINTENANCE').length

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Bed Management</h1>
          <p className="text-sm text-gray-400 mt-1">{beds.length} beds configured</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Bed</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card border-l-4 border-l-green-400">
          <p className="text-xs text-gray-400 mb-1">Available</p>
          <p className="font-display text-3xl font-semibold text-green-600">{available}</p>
        </div>
        <div className="stat-card border-l-4 border-l-teal-400">
          <p className="text-xs text-gray-400 mb-1">Occupied</p>
          <p className="font-display text-3xl font-semibold text-teal-600">{occupied}</p>
        </div>
        <div className="stat-card border-l-4 border-l-amber-400">
          <p className="text-xs text-gray-400 mb-1">Maintenance</p>
          <p className="font-display text-3xl font-semibold text-amber-500">{maintenance}</p>
        </div>
      </div>

      {/* Beds Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : beds.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🛏</p>
            <p className="text-gray-500 font-medium">No beds configured yet</p>
            <p className="text-gray-400 text-sm mt-1">Add beds to start admitting patients</p>
            <button className="btn btn-primary mt-4" onClick={openAdd}>+ Add First Bed</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Bed', 'Type', 'Rate/Day', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {beds.map(b => {
                const s = statusStyle[b.status] || statusStyle.AVAILABLE
                return (
                  <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{b.bedNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{b.bedType}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">₹{b.ratePerDay}</span>
                      <span className="text-gray-400 text-xs">/day</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.border} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button className="btn btn-sm" onClick={() => openEdit(b)}>
                          Edit
                        </button>
                        {b.status === 'OCCUPIED' && (
                          <button className="btn btn-sm"
                            onClick={() => updateStatus(b.id, 'AVAILABLE')}>
                            Free Up
                          </button>
                        )}
                        {b.status === 'AVAILABLE' && (
                          <button className="btn btn-sm"
                            onClick={() => updateStatus(b.id, 'MAINTENANCE')}>
                            Maintenance
                          </button>
                        )}
                        {b.status === 'MAINTENANCE' && (
                          <button className="btn btn-sm"
                            onClick={() => updateStatus(b.id, 'AVAILABLE')}>
                            Set Available
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editBed ? 'Edit Bed' : 'Add New Bed'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Bed Number / Name *</label>
              <input className="input" required placeholder="e.g. Bed 1, Ward A-2, ICU-1"
                value={form.bedNumber}
                onChange={e => setForm(f => ({ ...f, bedNumber: e.target.value }))} />
            </div>
            <div>
              <label className="label">Bed Type *</label>
              <select className="input" value={form.bedType}
                onChange={e => setForm(f => ({ ...f, bedType: e.target.value }))}>
                {BED_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Rate Per Day (₹) *</label>
              <input type="number" className="input" required min="0" placeholder="500"
                value={form.ratePerDay}
                onChange={e => setForm(f => ({ ...f, ratePerDay: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : editBed ? 'Update Bed' : 'Add Bed'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}