import { useState, useRef, useEffect } from 'react'
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
  const [queue, setQueue]             = useState([])
  const [pulse, setPulse]             = useState(false)
  const [prevCalling, setPrevCalling] = useState(null)

  const loadQueue = () => {
    receptionistAPI.getTodayQueue()
      .then(r => {
        const data = r.data.data || []
        setQueue(data)
        const current = data.find(q => q.status === 'WITH_DOCTOR')
        if (current && prevCalling !== current.tokenNumber) {
          setPulse(true)
          setPrevCalling(current.tokenNumber)
          setTimeout(() => setPulse(false), 3000)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadQueue()
    const t = setInterval(loadQueue, 15000)
    return () => clearInterval(t)
  }, [])
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
  const current = queue.find(q => q.status === 'WITH_DOCTOR') || null
  const nextUp  = queue.filter(q => q.status === 'WAITING')[0] || null

  return (

    <div className="p-7">
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">

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
        {/* end left column */}

        {/* RIGHT — Live Queue Panel (view only) */}
        <div className="w-64 flex-shrink-0 space-y-3">

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Live Status
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>

          {/* NOW CALLING */}
          {current ? (
            <div className="rounded-2xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, #9A3412 0%, #EA580C 100%)',
              boxShadow: pulse
                ? '0 0 0 3px rgba(37,99,235,0.5)'
                : '0 4px 12px rgba(30,58,138,0.3)',
              transition: 'box-shadow 0.5s ease',
            }}>
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                <div className="w-2 h-2 rounded-full bg-white"
                  style={{ animation: 'blink 1s infinite' }} />
                <span className="text-white text-xs font-bold uppercase tracking-widest opacity-90">
                  Now Calling
                </span>
                <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
              </div>
              <div className="px-4 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40
                    flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs opacity-80">Token</span>
                    <span className="text-white font-bold text-base leading-tight">
                      #{current.tokenNumber}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-base leading-tight truncate">
                      {current.patientName}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">
                      {current.patientAge} yrs · {current.patientGender}
                    </p>
                  </div>
                </div>
                <p className="text-white/60 text-xs italic truncate">{current.symptoms}</p>
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-white/80 text-xs text-center font-medium">
                    Please proceed to Doctor's Cabin
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4 text-center">
              <p className="text-gray-400 text-xs">No patient with doctor</p>
            </div>
          )}

          {/* NEXT IN LINE */}
          {nextUp ? (
            <div className="rounded-xl border-2 overflow-hidden"
              style={{ borderColor: '#DDD6FE', background: '#F5F3FF' }}>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: '#E1F5EE' }}>
                    <span className="text-xs" style={{ color: '#0F6E56' }}>Next</span>
                    <span className="font-bold text-sm leading-tight" style={{ color: '#0F6E56' }}>
                      #{nextUp.tokenNumber}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: '#1D9E75' }}>Up Next</p>
                    <p className="font-bold text-gray-800 text-sm leading-tight truncate">
                      {nextUp.patientName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {nextUp.patientAge} yrs · {nextUp.patientGender}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-teal-100 flex justify-between items-center">
                  <p className="text-xs text-gray-400 truncate max-w-[120px]">
                    {nextUp.symptoms}
                  </p>
                  <p className="text-xs font-bold text-teal-600 flex-shrink-0">
                    ~{nextUp.estimatedWaitMinutes || 0} min
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-gray-400 text-xs">No patients waiting</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-amber-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-amber-500 mb-0.5">Waiting</p>
              <p className="font-bold text-xl text-amber-600">
                {queue.filter(q => q.status === 'WAITING').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5 text-center">
              <p className="text-xs text-green-500 mb-0.5">Done</p>
              <p className="font-bold text-xl text-green-600">
                {queue.filter(q => q.status === 'COMPLETED').length}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-300 text-center">View only · updates every 15s</p>
        </div>
        {/* end right panel */}

      </div>
    </div>
  )
}