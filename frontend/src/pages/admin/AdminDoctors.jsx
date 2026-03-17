import { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  doctorName: '', clinicName: '', email: '', password: '',
  phoneNumber: '', specialization: '', clinicAddress: '',
  city: '', state: '', pincode: '',
  consultationFee: '', clinicStartTime: '09:00', clinicEndTime: '18:00',
  tokenStartNumber: 1, dailyTokenReset: true,
}

export default function AdminDoctors() {
  const [doctors, setDoctors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editDoc, setEditDoc]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getDoctors()
      .then(r => setDoctors(r.data.data || []))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditDoc(null); setShowModal(true) }
  const openEdit = (d) => {
    setForm({ ...EMPTY_FORM, ...d, password: '' })
    setEditDoc(d)
    setShowModal(true)
  }

    const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editDoc) {
        // Remove password from payload if empty — don't validate it on edit
        const payload = { ...form }
        if (!payload.password) delete payload.password
        await adminAPI.updateDoctor(editDoc.id, payload)
        toast.success('Doctor updated')
      } else {
        await adminAPI.createDoctor(form)
        toast.success('Doctor created')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (d) => {
    const next = d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await adminAPI.updateDoctorStatus(d.id, next)
      toast.success(`Doctor ${next.toLowerCase()}`)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manage Doctors</h1>
          <p className="text-sm text-gray-400 mt-1">{doctors.length} doctors registered on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Doctor','Clinic','Phone','City','Fee','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{d.doctorName}</div>
                    <div className="text-xs text-gray-400">{d.specialization}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.clinicName}</td>
                  <td className="px-4 py-3 text-gray-500">{d.phoneNumber}</td>
                  <td className="px-4 py-3 text-gray-500">{d.city}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">₹{d.consultationFee}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${d.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button
                        className={`btn btn-sm ${d.status === 'ACTIVE' ? 'btn-danger' : ''}`}
                        onClick={() => toggleStatus(d)}
                      >
                        {d.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No doctors found. Add your first doctor.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editDoc ? 'Edit Doctor' : 'Add New Doctor'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['doctorName','Doctor Name','text',true],
                ['clinicName','Clinic Name','text',true],
                ['email','Email','email',!editDoc],
                ['password', editDoc ? 'New Password (leave blank)' : 'Password','password',!editDoc],
                ['phoneNumber','Phone Number','text',true],
                ['specialization','Specialization','text',true],
                ['city','City','text',false],
                ['state','State','text',false],
                ['pincode','Pincode','text',false],
                ['consultationFee','Consultation Fee (₹)','number',false],
                ['clinicStartTime','Clinic Start','time',false],
                ['clinicEndTime','Clinic End','time',false],
              ].map(([key, label, type, req]) => (
                <div key={key}>
                  <label className="label">{label}{req && ' *'}</label>
                  <input
                    type={type}
                    className="input"
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    required={req}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="label">Clinic Address</label>
                <input className="input" value={form.clinicAddress} onChange={e => set('clinicAddress', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dailyReset" checked={form.dailyTokenReset}
                onChange={e => set('dailyTokenReset', e.target.checked)} />
              <label htmlFor="dailyReset" className="text-sm text-gray-600">Reset token numbers daily</label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : editDoc ? 'Update Doctor' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
