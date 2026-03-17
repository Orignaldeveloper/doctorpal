import { useEffect, useState } from 'react'
import { adminAPI } from '../../api/services'
import toast from 'react-hot-toast'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getDoctors()])
      .then(([s, d]) => {
        setStats(s.data.data)
        setDoctors(d.data.data?.slice(0, 5) || [])
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  const statCards = [
    { label: 'Total Doctors',       value: stats?.totalDoctors      ?? 0, color: 'text-teal-600' },
    { label: 'Active Clinics',      value: stats?.activeDoctors     ?? 0, color: 'text-blue-600' },
    { label: 'Receptionists',       value: stats?.totalReceptionists ?? 0, color: 'text-coral-400' },
    { label: 'Inactive Doctors',    value: stats?.inactiveDoctors   ?? 0, color: 'text-gray-400' },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="page-title">Platform Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back — here's what's happening across DoctorPal.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label} className="stat-card">
            <p className="text-xs text-gray-400 mb-1">{c.label}</p>
            <p className={`font-display text-3xl font-semibold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent doctors */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Doctor Accounts</h2>
          <a href="/admin/doctors" className="text-xs text-teal-600 hover:underline">View all →</a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-2.5 text-left font-medium">Doctor</th>
              <th className="px-5 py-2.5 text-left font-medium">Clinic</th>
              <th className="px-5 py-2.5 text-left font-medium">City</th>
              <th className="px-5 py-2.5 text-left font-medium">Specialization</th>
              <th className="px-5 py-2.5 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium">{d.doctorName}</td>
                <td className="px-5 py-3 text-gray-500">{d.clinicName}</td>
                <td className="px-5 py-3 text-gray-500">{d.city}</td>
                <td className="px-5 py-3 text-gray-500">{d.specialization}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${d.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400 text-sm">No doctors yet. Add your first doctor.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
