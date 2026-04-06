import { useEffect, useState } from 'react'
import { ipdAPI } from '../../../api/services'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function DischargedHistory() {
  const [all, setAll]           = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate]     = useState('')
  const navigate                = useNavigate()

  useEffect(() => {
    ipdAPI.getAllAdmissions()
      .then(r => {
        const discharged = (r.data.data || [])
          .filter(a => a.status === 'DISCHARGED')
          .sort((a, b) => new Date(b.dischargeDate) - new Date(a.dischargeDate))
        setAll(discharged)
        setFiltered(discharged)
      })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  // Apply filters whenever search or date changes
  useEffect(() => {
    let result = [...all]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        a.patientName?.toLowerCase().includes(q) ||
        a.patientPhone?.includes(q) ||
        a.diagnosis?.toLowerCase().includes(q)
      )
    }

    // Date filter
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateFilter === 'today') {
      result = result.filter(a => {
        const d = new Date(a.dischargeDate)
        return d >= today
      })
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - 6)
      result = result.filter(a => new Date(a.dischargeDate) >= weekStart)
    } else if (dateFilter === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      result = result.filter(a => new Date(a.dischargeDate) >= monthStart)
    } else if (dateFilter === 'custom' && fromDate && toDate) {
      const from = new Date(fromDate)
      const to   = new Date(toDate)
      to.setHours(23, 59, 59)
      result = result.filter(a => {
        const d = new Date(a.dischargeDate)
        return d >= from && d <= to
      })
    }

    setFiltered(result)
  }, [search, dateFilter, fromDate, toDate, all])

  const totalRevenue = filtered.reduce((s, a) => s + (a.totalPaid || 0), 0)
  const totalPending = filtered.reduce((s, a) => s + Math.max(0, (a.balanceDue || 0)), 0)
  const fullyPaid    = filtered.filter(a => (a.balanceDue || 0) <= 0).length

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : '—'

  const getDays = (a) => {
    if (!a.admissionDate || !a.dischargeDate) return '—'
    const days = Math.round(
      (new Date(a.dischargeDate) - new Date(a.admissionDate)) / 86400000
    )
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  const quickFilters = [
    { key: 'all',   label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week',  label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'custom', label: 'Custom Range' },
  ]

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Discharged Patients</h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete history of all discharged patients
          </p>
        </div>
        <button className="btn" onClick={() => navigate('/doctor/ipd')}>
          ← IPD Dashboard
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Total Discharged</p>
          <p className="font-display text-3xl font-semibold text-gray-800">
            {filtered.length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Fully Paid</p>
          <p className="font-display text-3xl font-semibold text-green-600">
            {fullyPaid}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Revenue Collected</p>
          <p className="font-display text-2xl font-semibold text-teal-600">
            ₹{totalRevenue.toFixed(0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Pending Balance</p>
          <p className={`font-display text-2xl font-semibold ${
            totalPending > 0 ? 'text-red-500' : 'text-green-600'
          }`}>
            ₹{totalPending.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">

          {/* Search */}
          <div className="flex-1">
            <input
              className="input"
              placeholder="Search by name, phone or diagnosis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Quick date filters */}
          <div className="flex gap-2 flex-wrap">
            {quickFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  dateFilter === f.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range */}
        {dateFilter === 'custom' && (
          <div className="flex gap-3 mt-3 items-center">
            <div>
              <label className="label">From Date</label>
              <input type="date" className="input"
                value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" className="input"
                value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            {fromDate && toDate && (
              <p className="text-xs text-gray-400 mt-4">
                {filtered.length} records found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No discharged patients found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try changing the search or date filter
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
               {['Bill No', 'Patient', 'Admission', 'Discharge', 'Days', 'Diagnosis',
                  'Total Bill', 'Paid', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const isPaid    = (a.balanceDue || 0) <= 0
                const balance   = a.balanceDue || 0

                return (
                  <tr key={a.id}
                    className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                    {a.billNumber ? (
                      <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                        {a.billNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-800">{a.patientName}</div>
                      <div className="text-xs text-gray-400">
                        {a.patientAge} yrs · {a.patientGender}
                      </div>
                      <div className="text-xs text-gray-400">{a.patientPhone}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs">
                      {fmtDate(a.admissionDate)}
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs">
                      {fmtDate(a.dischargeDate)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-teal-600">
                        {getDays(a)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs max-w-[120px] truncate">
                      {a.diagnosis}
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">
                      ₹{(a.totalBill || 0).toFixed(0)}
                    </td>
                    <td className="px-3 py-3 font-medium text-green-600">
                      ₹{(a.totalPaid || 0).toFixed(0)}
                    </td>
                    <td className="px-3 py-3">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          ₹{balance.toFixed(0)} due
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button
                          className="btn btn-sm"
                          onClick={() => navigate(`/doctor/ipd/${a.id}`)}>
                          Details
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => navigate(`/doctor/ipd/${a.id}/bill`)}>
                          Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} discharged patient{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </div>
        )}
      </div>
    </div>
  )
}