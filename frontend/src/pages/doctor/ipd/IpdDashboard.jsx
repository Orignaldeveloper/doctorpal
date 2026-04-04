import { useEffect, useState } from 'react'
import { ipdAPI } from '../../../api/services'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function IpdDashboard() {
  const [admitted, setAdmitted] = useState([])
  const [beds, setBeds]         = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate                = useNavigate()

  useEffect(() => {
    Promise.all([ipdAPI.getAdmitted(), ipdAPI.getBeds()])
      .then(([a, b]) => {
        setAdmitted(a.data.data || [])
        setBeds(b.data.data || [])
      })
      .catch(() => toast.error('Failed to load IPD data'))
      .finally(() => setLoading(false))
  }, [])

  const available   = beds.filter(b => b.status === 'AVAILABLE').length
  const occupied    = beds.filter(b => b.status === 'OCCUPIED').length
  const maintenance = beds.filter(b => b.status === 'MAINTENANCE').length

  const getDays = (admissionDate) => {
    const days = Math.floor((new Date() - new Date(admissionDate)) / 86400000)
    return days === 0 ? 'Today' : `${days}d`
  }

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
                <p className="text-xs text-gray-500 mt-0.5">₹{b.ratePerDay}/d</p>
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
                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
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
                    <div className="flex gap-1.5">
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
    </div>
  )
}