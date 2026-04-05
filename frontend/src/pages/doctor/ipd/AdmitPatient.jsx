import { useEffect, useState } from 'react'
import { ipdAPI } from '../../../api/services'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const today = () => new Date().toISOString().split('T')[0]

const EMPTY = {
  patientName: '', patientPhone: '', patientAge: '', patientGender: 'Male',
  patientAddress: '', bloodGroup: '', emergencyContact: '', emergencyPhone: '',
  bedId: '', diagnosis: '', admissionReason: '', advancePaid: '',
  admissionDate: today(),
  expectedDischargeDate: ''
}

export default function AdmitPatient() {
  const [form, setForm]     = useState(EMPTY)
  const [beds, setBeds]     = useState([])
  const [saving, setSaving] = useState(false)
  const navigate            = useNavigate()
  const set = (k, v)        => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    ipdAPI.getBeds()
      .then(r => setBeds((r.data.data || []).filter(b => b.status === 'AVAILABLE')))
      .catch(() => toast.error('Failed to load beds'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Validate discharge date is after admission date
      if (form.expectedDischargeDate && form.expectedDischargeDate < form.admissionDate) {
        toast.error('Discharge date cannot be before admission date!')
        setSaving(false)
        return
      }
      const payload = {
        ...form,
        patientAge:             parseInt(form.patientAge),
        advancePaid:            form.advancePaid ? parseFloat(form.advancePaid) : 0,
        admissionDate:          form.admissionDate || today(),
        expectedDischargeDate:  form.expectedDischargeDate || ''
      }
      const r = await ipdAPI.admitPatient(payload)
      toast.success(`${form.patientName} admitted successfully!`)
      navigate(`/doctor/ipd/${r.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admission failed')
    } finally {
      setSaving(false)
    }
  }

  const selectedBed = beds.find(b => b.id === form.bedId)
  const isBackdated = form.admissionDate && form.admissionDate !== today()

  // Calculate days for display
  const calcDays = () => {
    if (!form.admissionDate) return 0
    const end = form.expectedDischargeDate || today()
    const diff = Math.round(
      (new Date(end) - new Date(form.admissionDate)) / 86400000
    ) + 1
    return diff > 0 ? diff : 1
  }

  const selectedBedRate = selectedBed?.ratePerDay || 0
  const estimatedBedCost = calcDays() * selectedBedRate

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="page-title">Admit Patient</h1>
        <p className="text-sm text-gray-400 mt-1">
          Fill patient details and select a bed to admit
        </p>
      </div>

      {beds.length === 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
          <span className="text-amber-500 text-lg">⚠</span>
          <div>
            <p className="text-sm font-medium text-amber-800">No beds available</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Please free up a bed or add new beds before admitting a patient.
            </p>
          </div>
          <button className="btn btn-sm ml-auto"
            onClick={() => navigate('/doctor/ipd/beds')}>
            Manage Beds
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Patient Info */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
            Patient Information
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Patient Name *</label>
              <input className="input" required placeholder="Full name"
                value={form.patientName}
                onChange={e => set('patientName', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input className="input" required placeholder="10-digit phone"
                value={form.patientPhone}
                onChange={e => set('patientPhone', e.target.value)} />
            </div>
            <div>
              <label className="label">Age *</label>
              <input type="number" className="input" required min="1" max="150"
                value={form.patientAge}
                onChange={e => set('patientAge', e.target.value)} />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select className="input" value={form.patientGender}
                onChange={e => set('patientGender', e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Blood Group</label>
              <input className="input" placeholder="e.g. B+"
                value={form.bloodGroup}
                onChange={e => set('bloodGroup', e.target.value)} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" placeholder="Patient address"
                value={form.patientAddress}
                onChange={e => set('patientAddress', e.target.value)} />
            </div>
            <div>
              <label className="label">Emergency Contact Name</label>
              <input className="input" placeholder="Relative name"
                value={form.emergencyContact}
                onChange={e => set('emergencyContact', e.target.value)} />
            </div>
            <div>
              <label className="label">Emergency Contact Phone</label>
              <input className="input" placeholder="Relative phone"
                value={form.emergencyPhone}
                onChange={e => set('emergencyPhone', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Admission Details */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
            Admission Details
          </p>
          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className="label">Select Bed *</label>
              <select className="input" required value={form.bedId}
                onChange={e => set('bedId', e.target.value)}>
                <option value="">-- Select Available Bed --</option>
                {beds.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bedNumber} — {b.bedType} (₹{b.ratePerDay}/day)
                  </option>
                ))}
              </select>
            </div>

            {selectedBed && (
              <div className="col-span-2">
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-center gap-3">
                  <span className="text-2xl">🛏</span>
                  <div>
                    <p className="text-sm font-semibold text-teal-700">
                      {selectedBed.bedNumber}
                    </p>
                    <p className="text-xs text-teal-600">
                      {selectedBed.bedType} · ₹{selectedBed.ratePerDay}/day
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-2">
              <label className="label">Primary Diagnosis *</label>
              <input className="input" required
                placeholder="e.g. Dengue Fever, Post-op Recovery"
                value={form.diagnosis}
                onChange={e => set('diagnosis', e.target.value)} />
            </div>

            <div className="col-span-2">
              <label className="label">Reason for Admission</label>
              <textarea className="input resize-none" rows={2}
                placeholder="Additional details about admission..."
                value={form.admissionReason}
                onChange={e => set('admissionReason', e.target.value)} />
            </div>

            <div>
              <label className="label">Advance Payment (₹)</label>
              <input type="number" className="input" min="0" placeholder="0"
                value={form.advancePaid}
                onChange={e => set('advancePaid', e.target.value)} />
            </div>

            <div>
              <label className="label">
                Admission Date *
                {isBackdated && (
                  <span className="ml-2 text-xs text-amber-500 font-normal">
                    — Backdated
                  </span>
                )}
              </label>
              <input
                type="date"
                className="input"
                max={today()}
                value={form.admissionDate}
                onChange={e => {
                  set('admissionDate', e.target.value)
                  // Reset discharge date if admission date changes
                  set('expectedDischargeDate', '')
                }}
              />
            </div>

            {/* Backdated discharge section */}
            {isBackdated && (
              <div className="col-span-2">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">

                  <p className="text-sm font-semibold text-amber-800">
                    ⚠ Backdated Admission — Was this patient already discharged?
                  </p>

                  <div>
                    <label className="label">
                      Discharge Date
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        (Leave empty if still admitted)
                      </span>
                    </label>
                    <input
                      type="date"
                      className="input"
                      min={form.admissionDate}
                      max={today()}
                      value={form.expectedDischargeDate}
                      onChange={e => set('expectedDischargeDate', e.target.value)}
                    />
                  </div>

                  {/* Summary box */}
                  {form.expectedDischargeDate ? (
                    <div className="p-3 bg-white rounded-lg border border-amber-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-amber-700">
                          Bed Charge Calculation
                        </p>
                        <p className="text-xs font-bold text-teal-700">
                          {calcDays()} days × ₹{selectedBedRate} = ₹{estimatedBedCost}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        📅 {form.admissionDate} → {form.expectedDischargeDate}
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        ℹ Status stays <strong>ADMITTED</strong> after submission —
                        add medicines and other charges, then click Discharge.
                        Discharge date will be pre-filled automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-700">
                        No discharge date entered — bed charges will be calculated
                        from <strong>{form.admissionDate}</strong> to <strong>today</strong>.
                      </p>
                      {selectedBedRate > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Estimated: {calcDays()} days × ₹{selectedBedRate} = ₹{estimatedBedCost}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        <button
          type="submit"
          disabled={saving || beds.length === 0}
          className="btn btn-primary w-full py-3 text-base"
        >
          {saving ? 'Admitting Patient...' : '🏥 Admit Patient'}
        </button>
      </form>
    </div>
  )
}