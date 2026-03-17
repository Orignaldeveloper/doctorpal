import { useEffect, useState } from 'react'
import { receptionistAPI } from '../../api/services'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

export default function TodayQueue() {
  const [queue, setQueue]     = useState([])
  const [loading, setLoading] = useState(true)
  const [requeuing, setRequeuing] = useState(null)

  const load = () => {
    receptionistAPI.getTodayQueue()
      .then(r => setQueue(r.data.data || []))
      .catch(() => toast.error('Failed to load queue'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const handleReQueue = async (visitId, patientName) => {
    setRequeuing(visitId)
    try {
      const r = await receptionistAPI.reQueuePatient(visitId)
      const newToken = r.data.data?.tokenNumber
      toast.success(`${patientName} re-queued! New token #${newToken}`)
      load()
    } catch {
      toast.error('Re-queue failed')
    } finally {
      setRequeuing(null)
    }
  }

  const waiting   = queue.filter(q => q.status === 'WAITING').length
  const withDoc   = queue.filter(q => q.status === 'WITH_DOCTOR').length
  const completed = queue.filter(q => q.status === 'COMPLETED').length
  const skipped   = queue.filter(q => q.status === 'SKIPPED').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Today's Queue</h1>
          <p className="text-sm text-gray-400 mt-1">Auto-refreshes every 15 seconds</p>
        </div>
        <button className="btn" onClick={load}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Waiting</p>
          <p className="font-display text-3xl font-semibold text-amber-500">{waiting}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">With Doctor</p>
          <p className="font-display text-3xl font-semibold text-blue-600">{withDoc}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="font-display text-3xl font-semibold text-green-600">{completed}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Skipped</p>
          <p className="font-display text-3xl font-semibold text-purple-500">{skipped}</p>
        </div>
      </div>

      {/* Skipped patients alert */}
      {skipped > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
          <p className="text-sm text-purple-700 font-medium">
            {skipped} patient{skipped > 1 ? 's were' : ' was'} skipped by the doctor.
            Use <strong>Re-Queue</strong> if they have returned.
          </p>
        </div>
      )}

      {/* Queue table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Token','Patient','Symptoms','Check-in','Est. Wait','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map(q => (
                <tr
                  key={q.visitId}
                  className={`border-t border-gray-50 transition-colors ${
                    q.status === 'SKIPPED'
                      ? 'bg-purple-50 hover:bg-purple-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-display text-lg font-semibold text-teal-600">
                      #{q.tokenNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.patientName}</div>
                    <div className="text-xs text-gray-400">
                      {q.patientAge} yrs · {q.patientGender}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                    {q.symptoms}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {q.checkInTime
                      ? new Date(q.checkInTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {q.status === 'WAITING' ? `~${q.estimatedWaitMinutes} min` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3">
                    {q.status === 'SKIPPED' && (
                      <button
                        className="btn btn-sm font-medium"
                        style={{borderColor:'#9333ea', color:'#9333ea'}}
                        disabled={requeuing === q.visitId}
                        onClick={() => handleReQueue(q.visitId, q.patientName)}
                      >
                        {requeuing === q.visitId ? 'Re-queuing...' : '↺ Re-Queue'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No patients added yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}