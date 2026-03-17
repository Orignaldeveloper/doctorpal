import { useState, useRef } from 'react'
import { receptionistAPI } from '../../api/services'
import toast from 'react-hot-toast'

const EMPTY = {
  patientName: '', age: '', gender: 'Male',
  phoneNumber: '', symptoms: '', address: '', bloodGroup: '', notes: '',
}

export default function AddPatient() {
  const [form, setForm]           = useState(EMPTY)
  const [token, setToken]         = useState(null)
  const [saving, setSaving]       = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [returning, setReturning] = useState(false)
  const phoneTimer                = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhoneChange = (v) => {
    set('phoneNumber', v)
    clearTimeout(phoneTimer.current)
    if (v.length >= 10) {
      phoneTimer.current = setTimeout(() => autoDetect(v), 600)
    }
  }

  const autoDetect = async (phone) => {
    setDetecting(true)
    try {
      const r = await receptionistAPI.lookupPatient(phone)
      if (r.data.success && r.data.data) {
        const p = r.data.data
        setForm(f => ({
          ...f,
          patientName: p.name,
          age: String(p.age),
          gender: p.gender,
          bloodGroup: p.bloodGroup || '',
          address: p.address || '',
        }))
        setReturning(true)
        toast.success(`Returning patient: ${p.name}`)
      } else {
        setReturning(false)
      }
    } catch {
      setReturning(false)
    } finally {
      setDetecting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await receptionistAPI.addPatient({ ...form, age: parseInt(form.age) })
      const entry = r.data.data
      setToken(entry.tokenNumber)
      setForm(EMPTY)
      setReturning(false)
      toast.success(`Token #${entry.tokenNumber} generated!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add patient')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-7 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title">Add Patient Entry</h1>
          <p className="text-xs text-gray-400 mt-1">Fill details and generate token in one screen</p>
        </div>
        {returning && (
          <span className="badge badge-active text-xs px-3 py-1.5">
            Returning Patient — details auto filled!
          </span>
        )}
      </div>

      {/* Token display — shows after submit */}
      {token && (
        <div className="card border-l-4 border-l-teal-400 p-5 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-1">
              Token Generated
            </p>
            <p className="font-display text-5xl font-semibold text-teal-600">#{token}</p>
          </div>
          <button className="btn" onClick={() => setToken(null)}>Add Another Patient</button>
        </div>
      )}

      {!token && (
        <form onSubmit={handleSubmit}>

          {/* Patient Information */}
          <div className="card p-6 mb-4">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
              Patient Information
            </p>

            {/* Row 1 — Name and Age */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <label className="label">Patient Name *</label>
                <input
                  className="input" required placeholder="Full name"
                  value={form.patientName}
                  onChange={e => set('patientName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Age *</label>
                <input
                  type="number" className="input" required
                  placeholder="Age" min="1" max="150"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                />
              </div>
            </div>

            {/* Row 2 — Phone */}
            <div className="mb-4">
              <label className="label">
                Phone Number *
                {detecting && (
                  <span className="text-teal-500 text-xs ml-2">Checking...</span>
                )}
              </label>
              <input
                type="tel" className="input" required
                placeholder="Enter 10-digit phone"
                value={form.phoneNumber}
                onChange={e => handlePhoneChange(e.target.value)}
              />
            </div>

            {/* Row 3 — Gender and Blood Group */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Gender *</label>
                <select
                  className="input"
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Blood Group</label>
                <input
                  className="input" placeholder="e.g. B+"
                  value={form.bloodGroup}
                  onChange={e => set('bloodGroup', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="card p-6 mb-4">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
              Visit Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Symptoms *</label>
                <textarea
                  className="input resize-none" rows={3} required
                  placeholder="Describe symptoms..."
                  value={form.symptoms}
                  onChange={e => set('symptoms', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input resize-none" rows={3}
                  placeholder="Any additional notes..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Token bar + Submit */}
          <div
            className="flex items-center justify-between p-5 rounded-xl"
            style={{ background: '#E1F5EE' }}
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-teal-500 font-medium uppercase tracking-wide mb-0.5">
                  Next Token
                </p>
                <p className="font-display text-3xl font-bold text-teal-700">Auto</p>
              </div>
              <p className="text-xs text-teal-600 max-w-[200px] leading-relaxed">
                Token number is automatically assigned on submission
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary px-8 py-3 text-base"
            >
              {saving ? 'Generating...' : 'Generate Token & Add'}
            </button>
          </div>

        </form>
      )}
    </div>
  )
}