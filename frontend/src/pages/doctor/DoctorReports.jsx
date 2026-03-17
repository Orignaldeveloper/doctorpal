import { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import toast from 'react-hot-toast'

const TABS = ['Daily', 'Weekly', 'Monthly']

export default function DoctorReports() {
  const [tab, setTab]       = useState('Daily')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = (t = tab) => {
    setLoading(true)
    const fn = t === 'Daily' ? doctorAPI.dailyReport
             : t === 'Weekly' ? doctorAPI.weeklyReport
             : doctorAPI.monthlyReport
    fn()
      .then(r => setReport(r.data.data))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [tab])

  const switchTab = (t) => { setTab(t); load(t) }

  const barData = report?.dailyBreakdown
    ? Object.entries(report.dailyBreakdown)
    : []
  const maxBar = barData.length > 0 ? Math.max(...barData.map(([,v]) => v)) : 1

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="text-sm text-gray-400 mt-1">Track patient visit trends for your clinic</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 py-8">Loading report...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Patients', value: report?.totalPatients ?? 0, color: 'text-teal-600' },
              { label: 'Completed',      value: report?.completed     ?? 0, color: 'text-green-600' },
              { label: 'Cancelled',      value: report?.cancelled     ?? 0, color: 'text-red-400' },
              { label: 'Waiting / Active', value: (report?.waiting ?? 0) + (report?.totalPatients - (report?.completed ?? 0) - (report?.cancelled ?? 0) > 0 ? 0 : 0), color: 'text-amber-500' },
            ].map(c => (
              <div key={c.label} className="stat-card">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className={`font-display text-3xl font-semibold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Busiest day */}
          {report?.busiestDay && (
            <div className="card p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-lg">★</div>
              <div>
                <p className="text-xs text-gray-400">Busiest Day This Week</p>
                <p className="font-medium text-gray-800">{report.busiestDay}</p>
              </div>
            </div>
          )}

          {/* Bar chart for weekly */}
          {barData.length > 0 && (
            <div className="card p-5 mb-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Breakdown</h2>
              <div className="flex items-end gap-3 h-28">
                {barData.map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-xs text-gray-400">{count}</span>
                    <div
                      className={`w-full rounded-t transition-all ${
                        count === maxBar ? 'bg-teal-600' : 'bg-teal-100'
                      }`}
                      style={{ height: `${Math.max((count / maxBar) * 100, 4)}px` }}
                    />
                    <span className="text-xs text-gray-400 truncate w-full text-center">{day.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion rate bar */}
          {report?.totalPatients > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Completion Rate</h2>
              {[
                { label: 'Completed', value: report?.completed ?? 0, color: 'bg-teal-500' },
                { label: 'Cancelled', value: report?.cancelled ?? 0, color: 'bg-red-300' },
              ].map(item => {
                const pct = Math.round((item.value / (report?.totalPatients || 1)) * 100)
                return (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{item.label}</span><span>{pct}% ({item.value})</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
