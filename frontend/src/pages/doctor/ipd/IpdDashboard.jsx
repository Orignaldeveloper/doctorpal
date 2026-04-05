import { useEffect, useState } from 'react'
import { ipdAPI } from '../../../api/services'
import { useNavigate } from 'react-router-dom'
import Modal from '../../../components/common/Modal'
import toast from 'react-hot-toast'

export default function IpdDashboard() {
  const [admitted, setAdmitted]   = useState([])
  const [beds, setBeds]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [editAdm, setEditAdm]     = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const navigate                  = useNavigate()

  const load = () => {
    Promise.all([ipdAPI.getAdmitted(), ipdAPI.getBeds()])
      .then(([a, b]) => {
        setAdmitted(a.data.data || [])
        setBeds(b.data.data || [])
      })
      .catch(() => toast.error('Failed to load IPD data'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const available   = beds.filter(b => b.status === 'AVAILABLE').length
  const occupied    = beds.filter(b => b.status === 'OCCUPIED').length
  const maintenance = beds.filter(b => b.status === 'MAINTENANCE').length

  const getDays = (admissionDate) => {
    const days = Math.floor((new Date() - new Date(admissionDate)) / 86400000)
    return days === 0 ? 'Today' : `${days}d`
  }

  const openEdit = (a) => {
    setEditForm({
      patientName:      a.patientName,
      patientPhone:     a.patientPhone,
      patientAge:       a.patientAge,
      patientGender:    a.patientGender,
      patientAddress:   a.patientAddress || '',
      bloodGroup:       a.bloodGroup || '',
      emergencyContact: a.emergencyContact || '',
      emergencyPhone:   a.emergencyPhone || '',
      bedId:            a.bedId,
      diagnosis:        a.diagnosis,
      admissionReason:  a.admissionReason || '',
    })
    setEditAdm(a)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await ipdAPI.updateAdmission(editAdm.id, {
        ...editForm,
        patientAge: parseInt(editForm.patientAge),
      })
      toast.success('Admission updated successfully!')
      setEditAdm(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const set = (k, v) => setEditForm(f => ({ ...f, [k]: v }))

  // Available beds + current bed of patient (so it shows in dropdown)
  const editableBeds = beds.filter(b =>
    b.status === 'AVAILABLE' || b.id === editAdm?.bedId
  )

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div className="text-gray-400">Loading IPD data...</div>
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">IPD Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">In-Patient Department Overview</p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => navigate('/doctor/ipd/beds')}>
            🛏 Manage Beds
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/doctor/ipd/admit')}>
            + Admit Patient
          </button>
        </div>
      </div>

      {/* Bed Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Total Beds</p>
          <p className="font-display text-3xl font-semibold text-gray-700">{beds.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Available</p>
          <p className="font-display text-3xl font-semibold text-green-600">{available}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Occupied</p>
          <p className="font-display text-3xl font-semibold text-teal-600">{occupied}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Maintenance</p>
          <p className="font-display text-3xl font-semibold text-amber-500">{maintenance}</p>
        </div>
      </div>

      {/* Bed Grid */}
      {beds.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Bed Status</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {beds.map(b => (
              <div key={b.id} className={`rounded-xl p-3 text-center border-2 ${
                b.status === 'AVAILABLE'   ? 'bg-green-50 border-green-200' :
                b.status === 'OCCUPIED'    ? 'bg-teal-50 border-teal-200' :
                'bg-amber-50 border-amber-200'
              }`}>
                <p className={`text-xs font-bold ${
                  b.status === 'AVAILABLE'  ? 'text-green-700' :
                  b.status === 'OCCUPIED'   ? 'text-teal-700' :
                  'text-amber-700'
                }`}>{b.bedNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">₹{b.ratePerDay}/d</p>
                <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                  b.status === 'AVAILABLE'  ? 'bg-green-400' :
                  b.status === 'OCCUPIED'   ? 'bg-teal-400' :
                  'bg-amber-400'
                }`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admitted Patients Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            Currently Admitted
            <span className="ml-2 bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">
              {admitted.length}
            </span>
          </h2>
        </div>

        {admitted.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🏥</p>
            <p className="text-gray-500 font-medium">No patients currently admitted</p>
            <p className="text-gray-400 text-sm mt-1">Click "Admit Patient" to get started</p>
            <button className="btn btn-primary mt-4"
              onClick={() => navigate('/doctor/ipd/admit')}>
              + Admit First Patient
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Patient', 'Bed', 'Diagnosis', 'Admitted', 'Days', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admitted.map(a => (
                <tr key={a.id}
                  className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{a.patientName}</div>
                    <div className="text-xs text-gray-400">
                      {a.patientAge} yrs · {a.patientGender}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-active">
                      {beds.find(b => b.id === a.bedId)?.bedNumber || '—'}
                    </span>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {beds.find(b => b.id === a.bedId)?.bedType || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                    {a.diagnosis}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(a.admissionDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-teal-600 text-sm">
                      {getDays(a.admissionDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <button className="btn btn-sm"
                        onClick={() => openEdit(a)}>
                        ✏ Edit
                      </button>
                      <button className="btn btn-sm"
                        onClick={() => navigate(`/doctor/ipd/${a.id}`)}>
                        Details
                      </button>
                      <button className="btn btn-sm"
                        onClick={() => navigate(`/doctor/ipd/${a.id}/bill`)}>
                        Bill
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Admission Modal */}
      {editAdm && (
        <Modal
          title={`Edit Admission — ${editAdm.patientName}`}
          onClose={() => setEditAdm(null)}
        >
          <form onSubmit={handleEdit} className="space-y-4">

            {/* Bed change warning */}
            {editForm.bedId !== editAdm.bedId && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs text-amber-700 font-medium">
                  ⚠ Bed Change — Old bed will be freed, new bed will be occupied.
                  New bed rate applies from today.
                </p>
              </div>
            )}

            {/* Bed Selection */}
            <div>
              <label className="label">
                Bed Assignment
                {editForm.bedId !== editAdm.bedId && (
                  <span className="ml-2 text-xs text-amber-500">Changed!</span>
                )}
              </label>
              <select className="input" value={editForm.bedId}
                onChange={e => set('bedId', e.target.value)}>
                {editableBeds.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bedNumber} — {b.bedType} (₹{b.ratePerDay}/day)
                    {b.id === editAdm.bedId ? ' ← Current' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Patient Name *</label>
                <input className="input" required value={editForm.patientName}
                  onChange={e => set('patientName', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" required value={editForm.patientPhone}
                  onChange={e => set('patientPhone', e.target.value)} />
              </div>
              <div>
                <label className="label">Age *</label>
                <input type="number" className="input" required
                  value={editForm.patientAge}
                  onChange={e => set('patientAge', e.target.value)} />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select className="input" value={editForm.patientGender}
                  onChange={e => set('patientGender', e.target.value)}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Blood Group</label>
                <input className="input" value={editForm.bloodGroup}
                  onChange={e => set('bloodGroup', e.target.value)} />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" value={editForm.patientAddress}
                  onChange={e => set('patientAddress', e.target.value)} />
              </div>
              <div>
                <label className="label">Emergency Contact</label>
                <input className="input" value={editForm.emergencyContact}
                  onChange={e => set('emergencyContact', e.target.value)} />
              </div>
              <div>
                <label className="label">Emergency Phone</label>
                <input className="input" value={editForm.emergencyPhone}
                  onChange={e => set('emergencyPhone', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Diagnosis *</label>
                <input className="input" required value={editForm.diagnosis}
                  onChange={e => set('diagnosis', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Admission Reason</label>
                <textarea className="input resize-none" rows={2}
                  value={editForm.admissionReason}
                  onChange={e => set('admissionReason', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn"
                onClick={() => setEditAdm(null)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}