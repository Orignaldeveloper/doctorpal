import { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import toast from 'react-hot-toast'

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MOCK_BARS = [62, 78, 55, 91, 83, 47, 22]

export default function AdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  const max = Math.max(...MOCK_BARS)

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="page-title">Platform Statistics</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time performance across all clinics</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Doctors',       value: stats?.totalDoctors       ?? 0, color: 'text-teal-600' },
          { label: 'Active Doctors',      value: stats?.activeDoctors      ?? 0, color: 'text-green-600' },
          { label: 'Inactive Doctors',    value: stats?.inactiveDoctors    ?? 0, color: 'text-gray-400' },
          { label: 'Total Receptionists', value: stats?.totalReceptionists ?? 0, color: 'text-blue-600' },
          { label: 'Patients Today',      value: stats?.patientsToday      ?? 0, color: 'text-coral-400' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <p className="text-xs text-gray-400 mb-1">{c.label}</p>
            <p className={`font-display text-3xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Visit Trend (Platform-wide)</h2>
        <div className="flex items-end gap-3 h-32">
          {MOCK_BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{h}</span>
              <div
                className={`w-full rounded-t transition-all ${i === 3 ? 'bg-teal-600' : 'bg-teal-100'}`}
                style={{ height: `${(h / max) * 100}px` }}
              />
              <span className="text-xs text-gray-400">{DAYS[i]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">Thursday is the busiest day across all clinics</p>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Platform Health</h2>
        <div className="space-y-3">
          {[
            { label: 'Doctor Activation Rate', pct: stats?.activeDoctors && stats?.totalDoctors
                ? Math.round((stats.activeDoctors / stats.totalDoctors) * 100) : 0, color: 'bg-teal-500' },
            { label: 'Queue Completion Rate (Today)', pct: 78, color: 'bg-blue-500' },
            { label: 'Platform Uptime', pct: 99, color: 'bg-green-500' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{item.label}</span><span>{item.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
