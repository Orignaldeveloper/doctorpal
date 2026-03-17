import { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function DoctorQueue() {
  const [queue, setQueue]     = useState([])
  const [loading, setLoading] = useState(true)
  const [calling, setCalling] = useState(false)
  const [error, setError]     = useState(null)

  const load = () => {
    setError(null)
    doctorAPI.getQueue()
      .then(r => {
        const data = r?.data?.data
        setQueue(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Queue load error:', err)
        setError('Failed to load queue. Please refresh.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  const nextPatient = async () => {
    setCalling(true)
    try {
      await doctorAPI.nextPatient()
      toast.success('Next patient called!')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No patients waiting')
    } finally {
      setCalling(false)
    }
  }

  const updateStatus = async (visitId, status) => {
    if (!visitId) return
    try {
      await doctorAPI.updateVisitStatus(visitId, status)
      load()
    } catch {
      toast.error('Update failed')
    }
  }

const handleSkipCurrent = async () => {
    if (!current?.visitId) return
    try {
      // Mark current as SKIPPED
      await doctorAPI.updateVisitStatus(current.visitId, 'SKIPPED')
      toast.success(`${current.patientName} skipped — calling next patient`)
      // Auto call next waiting patient
      const nextWaiting = queue.find(q => q.status === 'WAITING')
      if (nextWaiting) {
        await doctorAPI.updateVisitStatus(nextWaiting.visitId, 'WITH_DOCTOR')
        toast.success(`Token #${nextWaiting.tokenNumber} — ${nextWaiting.patientName} called!`)
      } else {
        toast('No more patients waiting', { icon: '📋' })
      }
      load()
    } catch {
      toast.error('Skip failed')
    }
  }

  const deleteVisit = async (visitId) => {
    if (!visitId) return
    if (!confirm('Remove this patient from queue?')) return
    try {
      await doctorAPI.deleteVisit(visitId)
      toast.success('Removed')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  // Safe derived values — never crashes even if queue is empty or malformed
  const current   = queue.find(q => q?.status === 'WITH_DOCTOR') || null
  const waiting   = queue.filter(q => q?.status === 'WAITING')
  const done      = queue.filter(q => q?.status === 'COMPLETED').length
  const skipped   = queue.filter(q => q?.status === 'SKIPPED').length

  // Error state
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 mt-20">
        <p className="text-red-400 text-sm">{error}</p>
        <button className="btn btn-primary" onClick={load}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Live Patient Queue</h1>
          <p className="text-sm text-gray-400 mt-1">
            {waiting.length} waiting · {done} completed · {skipped} skipped today
          </p>
        </div>
        <button
          className="btn btn-primary px-5 py-2.5"
          onClick={nextPatient}
          disabled={calling}
        >
          {calling ? 'Calling...' : '→ Next Patient'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Waiting</p>
          <p className="font-display text-3xl font-semibold text-amber-500">
            {waiting.length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">With Doctor</p>
          <p className="font-display text-3xl font-semibold text-blue-600">
            {current ? 1 : 0}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="font-display text-3xl font-semibold text-green-600">
            {done}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Skipped</p>
          <p className="font-display text-3xl font-semibold text-purple-500">
            {skipped}
          </p>
        </div>
      </div>

      {/* Current patient card */}
      {current && (
        <div className="card mb-6 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Currently With Doctor
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-sm"
                onClick={() => updateStatus(current.visitId, 'COMPLETED')}
              >
                ✓ Mark Complete
              </button>
              <button
                className="btn btn-sm"
                style={{ borderColor: '#9333ea', color: '#9333ea' }}
                onClick={() => handleSkipCurrent()}
              >
                ↷ Skip — Not Present
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => updateStatus(current.visitId, 'CANCELLED')}
              >
                ✕ Cancel
              </button>
            </div>
          </div>

          {/* Patient info — horizontal */}
          <div className="flex items-stretch" style={{ background: '#E1F5EE' }}>

            <div className="flex flex-col items-center justify-center px-10 py-6 min-w-[120px]"
              style={{ background: '#E1F5EE' }}>
              <span className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">Token</span>
              <span className="font-display text-4xl font-bold text-teal-700">
                #{current.tokenNumber}
              </span>
            </div>

            <div className="w-px bg-teal-200 my-4" />

            <div className="flex flex-col justify-center px-10 py-6 min-w-[200px]"
              style={{ background: '#E1F5EE' }}>
              <span className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">Patient</span>
              <span className="text-xl font-bold text-teal-900 leading-tight">
                {current.patientName}
              </span>
            </div>

            <div className="w-px bg-teal-200 my-4" />

            <div className="flex flex-col justify-center px-10 py-6 min-w-[120px]"
              style={{ background: '#E1F5EE' }}>
              <span className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">Age</span>
              <span className="text-xl font-bold text-teal-900">
                {current.patientAge}
                <span className="text-sm font-medium text-teal-500 ml-1">yrs</span>
              </span>
            </div>

            <div className="w-px bg-teal-200 my-4" />

            <div className="flex flex-col justify-center px-10 py-6 min-w-[120px]"
              style={{ background: '#E1F5EE' }}>
              <span className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">Gender</span>
              <span className="text-xl font-bold text-teal-900">
                {current.patientGender}
              </span>
            </div>

            <div className="w-px bg-teal-200 my-4" />

            <div className="flex flex-col justify-center px-10 py-6 flex-1"
              style={{ background: '#E1F5EE' }}>
              <span className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">Symptoms</span>
              <span className="text-base font-bold text-teal-900 leading-snug">
                {current.symptoms}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="card p-8 text-center text-gray-400">Loading queue...</div>
      )}

      {/* Queue table */}
      {!loading && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-600">Full Queue — Today</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                {['Token','Patient','Symptoms','Age/Gender','Est. Wait','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map((q, i) => {
                if (!q) return null
                return (
                  <tr
                    key={q.visitId || i}
                    className={`border-t border-gray-50 transition-colors ${
                      q.status === 'SKIPPED'
                        ? 'bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-display text-lg font-semibold text-teal-600">
                        #{q.tokenNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{q.patientName}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                      {q.symptoms}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {q.patientAge}y · {q.patientGender}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {q.status === 'WAITING' ? `~${q.estimatedWaitMinutes || 0} min` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {q.status === 'WAITING' && (
                          <>
                            <button
                              className="btn btn-sm"
                              onClick={() => updateStatus(q.visitId, 'WITH_DOCTOR')}
                            >
                              Call
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updateStatus(q.visitId, 'CANCELLED')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {q.status === 'WITH_DOCTOR' && (
                          <button
                            className="btn btn-sm"
                            onClick={() => updateStatus(q.visitId, 'COMPLETED')}
                          >
                            Complete
                          </button>
                        )}
                        {q.status === 'SKIPPED' && (
                          <span className="text-xs text-purple-500 italic px-1">
                            Receptionist can re-queue
                          </span>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteVisit(q.visitId)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {queue.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Queue is empty. Receptionist can add patients.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}