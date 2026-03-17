import { useEffect, useState } from 'react'
import { doctorAPI } from '../../api/services'
import Modal from '../../components/common/Modal'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'

const QUICK_FILTERS = [
  { label: 'Today',      getValue: () => { const d = new Date().toISOString().split('T')[0]; return { from: d, to: d } } },
  { label: 'Yesterday',  getValue: () => { const d = new Date(); d.setDate(d.getDate()-1); const s = d.toISOString().split('T')[0]; return { from: s, to: s } } },
  { label: 'This Week',  getValue: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); return { from: mon.toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] } } },
  { label: 'This Month', getValue: () => { const now = new Date(); return { from: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`, to: new Date().toISOString().split('T')[0] } } },
  { label: 'Last Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth()-1, 1); const last = new Date(now.getFullYear(), now.getMonth(), 0); return { from: first.toISOString().split('T')[0], to: last.toISOString().split('T')[0] } } },
]

export default function DoctorPatients() {
  const [patients, setPatients]       = useState([])
  const [allVisits, setAllVisits]     = useState([])
  const [query, setQuery]             = useState('')
  const [loading, setLoading]         = useState(true)
  const [visitsLoading, setVisitsLoading] = useState(true)
  const [history, setHistory]         = useState([])
  const [histPatient, setHistPatient] = useState(null)
  const [histLoading, setHistLoading] = useState(false)
  const [fromDate, setFromDate]       = useState('')
  const [toDate, setToDate]           = useState('')
  const [activeQuick, setActiveQuick] = useState('')

  const today = new Date().toISOString().split('T')[0]

  // Load all patients
  const search = (q = query) => {
    setLoading(true)
    doctorAPI.searchPatients(q)
      .then(r => setPatients(r.data.data || []))
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false))
  }

  // Load all visits for all patients to enable date filtering
  const loadAllVisits = async (patientList) => {
    setVisitsLoading(true)
    try {
      const allV = []
      for (const p of patientList) {
        const r = await doctorAPI.getPatientHistory(p.id)
        const visits = r.data.data || []
        visits.forEach(v => allV.push({ ...v, patientName: p.name, patientPhone: p.phone, patientAge: p.age, patientGender: p.gender }))
      }
      setAllVisits(allV)
    } catch {
      toast.error('Failed to load visits')
    } finally {
      setVisitsLoading(false)
    }
  }

  useEffect(() => { search('') }, [])

  useEffect(() => {
    if (patients.length > 0) loadAllVisits(patients)
  }, [patients])

  // Apply date filter to visits
  const filteredVisits = allVisits.filter(v => {
    if (!v.visitDate) return false
    const vDate = v.visitDate.split('T')[0]
    if (fromDate && vDate < fromDate) return false
    if (toDate   && vDate > toDate)   return false
    return true
  })

  // Group filtered visits by date
  const visitsByDate = filteredVisits.reduce((acc, v) => {
    const d = v.visitDate.split('T')[0]
    if (!acc[d]) acc[d] = []
    acc[d].push(v)
    return acc
  }, {})

  const sortedDates = Object.keys(visitsByDate).sort((a, b) => b.localeCompare(a))

  const applyQuickFilter = (qf) => {
    const { from, to } = qf.getValue()
    setFromDate(from)
    setToDate(to)
    setActiveQuick(qf.label)
  }

  const clearFilter = () => {
    setFromDate('')
    setToDate('')
    setActiveQuick('')
  }

  const viewHistory = async (p) => {
    setHistPatient(p)
    setHistLoading(true)
    setHistory([])
    try {
      const r = await doctorAPI.getPatientHistory(p.id)
      setHistory(r.data.data || [])
    } catch {
      toast.error('Failed to load history')
    } finally {
      setHistLoading(false)
    }
  }

  const closeModal = () => { setHistPatient(null); setHistory([]) }

  const isFilterActive = fromDate || toDate

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Patient History</h1>
        <p className="text-sm text-gray-400 mt-1">Filter by date to see daily and monthly visit reports</p>
      </div>

      {/* Date Filter Card */}
      <div className="card p-4 mb-5">

        {/* Quick filter buttons */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-medium text-gray-500 mr-1">Quick:</span>
          {QUICK_FILTERS.map(qf => (
            <button
              key={qf.label}
              onClick={() => applyQuickFilter(qf)}
              className={`btn btn-sm ${activeQuick === qf.label ? 'btn-primary' : ''}`}
            >
              {qf.label}
            </button>
          ))}
          {isFilterActive && (
            <button
              onClick={clearFilter}
              className="btn btn-sm text-red-400 border-red-200 hover:bg-red-50 ml-auto"
            >
              ✕ Clear Filter
            </button>
          )}
        </div>

        {/* Calendar inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              className="input"
              max={today}
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setActiveQuick('') }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              className="input"
              max={today}
              min={fromDate || ''}
              value={toDate}
              onChange={e => { setToDate(e.target.value); setActiveQuick('') }}
            />
          </div>
        </div>

        {/* Summary stats when filter active */}
        {isFilterActive && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="bg-teal-50 rounded-lg p-3 text-center">
              <p className="text-xs text-teal-600 mb-1">Total Visits</p>
              <p className="text-2xl font-semibold text-teal-700 font-display">
                {visitsLoading ? '...' : filteredVisits.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 mb-1">Completed</p>
              <p className="text-2xl font-semibold text-green-700 font-display">
                {visitsLoading ? '...' : filteredVisits.filter(v => v.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-600 mb-1">Days Active</p>
              <p className="text-2xl font-semibold text-amber-700 font-display">
                {visitsLoading ? '...' : sortedDates.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Show date-wise breakdown when filter is active */}
      {isFilterActive ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Visit breakdown {fromDate && toDate ? `(${new Date(fromDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} — ${new Date(toDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })})` : ''}
          </h2>

          {visitsLoading ? (
            <div className="card p-8 text-center text-gray-400">Loading visits...</div>
          ) : sortedDates.length === 0 ? (
            <div className="card p-8 text-center text-gray-400">No visits found in this date range.</div>
          ) : (
            <div className="space-y-3">
              {sortedDates.map(date => (
                <div key={date} className="card overflow-hidden">
                  {/* Date header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-teal-700">
                          {new Date(date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-active">
                      {visitsByDate[date].length} visit{visitsByDate[date].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Visits for that date */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                        <th className="px-4 py-2 text-left font-medium">Token</th>
                        <th className="px-4 py-2 text-left font-medium">Patient</th>
                        <th className="px-4 py-2 text-left font-medium">Phone</th>
                        <th className="px-4 py-2 text-left font-medium">Symptoms</th>
                        <th className="px-4 py-2 text-left font-medium">Time</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitsByDate[date]
                        .sort((a,b) => a.tokenNumber - b.tokenNumber)
                        .map(v => (
                        <tr key={v.visitId} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <span className="font-display text-base font-semibold text-teal-600">#{v.tokenNumber}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-800">{v.patientName}</p>
                            <p className="text-xs text-gray-400">{v.patientAge}y · {v.patientGender}</p>
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">{v.patientPhone}</td>
                          <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{v.symptoms}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">
                            {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '—'}
                          </td>
                          <td className="px-4 py-2.5"><StatusBadge status={v.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default view — show all patients with search */
        <div>
          <div className="flex gap-3 mb-4">
            <input
              className="input max-w-sm"
              placeholder="Search by name or phone..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button className="btn btn-primary" onClick={() => search()}>Search</button>
            <button className="btn" onClick={() => { setQuery(''); search('') }}>Clear</button>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    {['Patient','Age / Gender','Phone','Blood Group','Registered','Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.age} yrs · {p.gender}</td>
                      <td className="px-4 py-3 text-gray-500">{p.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{p.bloodGroup || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button className="btn btn-sm" onClick={() => viewHistory(p)}>
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Visit History Modal — no date filter inside now */}
      {histPatient && (
        <Modal title={`Visit History — ${histPatient.name}`} onClose={closeModal}>
          {histLoading ? (
            <div className="py-6 text-center text-gray-400">Loading visits...</div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No visits recorded yet.</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {history.map(v => (
                <div key={v.visitId} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl font-semibold text-teal-600">#{v.tokenNumber}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="text-xs font-medium text-gray-400 mr-1">Symptoms:</span>{v.symptoms}
                  </p>
                  {v.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="text-xs font-medium text-gray-400 mr-1">Notes:</span>{v.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
            <button className="btn" onClick={closeModal}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  )
}