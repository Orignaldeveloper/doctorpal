import { useEffect, useState } from 'react'
import { ipdAPI } from '../../../api/services'
import { useParams, useNavigate } from 'react-router-dom'
import Modal from '../../../components/common/Modal'
import toast from 'react-hot-toast'

const CHARGE_TYPES  = ['BED','MEDICINE','DOCTOR_VISIT','INVESTIGATION','PROCEDURE','OTHER']
const PAYMENT_MODES = ['Cash','UPI','Card','Cheque','NEFT']

export default function PatientDetail() {
  const { admissionId } = useParams()
  const navigate        = useNavigate()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCharge, setShowCharge]     = useState(false)
  const [showPayment, setShowPayment]   = useState(false)
  const [showDischarge, setShowDischarge] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [medicineInput, setMedicineInput] = useState('')
  const [dischargeDate, setDischargeDate] = useState('')

  const [chargeForm, setChargeForm] = useState({
    admissionId, chargeType: 'MEDICINE', description: '', amount: '', quantity: 1
  })
  const [paymentForm, setPaymentForm] = useState({
    admissionId, amount: '', paymentMode: 'Cash', note: ''
  })
  const [dischargeForm, setDischargeForm] = useState({
    admissionId, treatmentSummary: '', dischargeAdvice: '', medicinesOnDischarge: []
  })

  const load = () => {
    ipdAPI.getBill(admissionId)
      .then(r => {
        setBill(r.data.data)
        if (r.data.data?.admission?.expectedDischargeDate) {
          setDischargeDate(r.data.data.admission.expectedDischargeDate)
        }
      })
      .catch(() => toast.error('Failed to load patient data'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [admissionId])

  const addCharge = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await ipdAPI.addCharge({ ...chargeForm, amount: parseFloat(chargeForm.amount) })
      toast.success('Charge added')
      setShowCharge(false)
      setChargeForm({ admissionId, chargeType: 'MEDICINE', description: '', amount: '', quantity: 1 })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const addPayment = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await ipdAPI.addPayment({ ...paymentForm, amount: parseFloat(paymentForm.amount) })
      toast.success('Payment recorded')
      setShowPayment(false)
      setPaymentForm({ admissionId, amount: '', paymentMode: 'Cash', note: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDischarge = async (e) => {
    e.preventDefault()
    if (!confirm('Discharge this patient? This cannot be undone.')) return
    setSaving(true)
    try {
       await ipdAPI.discharge({
        ...dischargeForm,
        dischargeDate: dischargeDate || new Date().toISOString().split('T')[0]
      })
      toast.success('Patient discharged successfully')
      navigate(`/doctor/ipd/${admissionId}/bill`)
    } catch (err) { toast.error(err.response?.data?.message || 'Discharge failed') }
    finally { setSaving(false) }
  }

  const deleteCharge = async (chargeId) => {
    if (!confirm('Delete this charge?')) return
    try {
      await ipdAPI.deleteCharge(chargeId)
      toast.success('Charge deleted'); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete auto-generated charge')
    }
  }

  const addMedicine = () => {
    if (!medicineInput.trim()) return
    setDischargeForm(f => ({
      ...f, medicinesOnDischarge: [...(f.medicinesOnDischarge || []), medicineInput.trim()]
    }))
    setMedicineInput('')
  }

  if (loading) return <div className="p-6 text-gray-400">Loading patient data...</div>
  if (!bill)   return <div className="p-6 text-gray-400">Patient not found</div>

  const { admission, charges, payments, totalCharges, totalPaid, balanceDue, totalDays } = bill
  const isAdmitted = admission.status === 'ADMITTED'

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{admission.patientName}</h1>
            <span className={`badge ${isAdmitted ? 'badge-active' : 'badge-inactive'}`}>
              {admission.status}
            </span>
            {admission.billNumber && (
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                {admission.billNumber}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {admission.patientAge} yrs · {admission.patientGender} · {admission.diagnosis}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Admitted: {new Date(admission.admissionDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button className="btn" onClick={() => navigate(`/doctor/ipd/${admissionId}/bill`)}>
            🖨 View Bill
          </button>
          {isAdmitted && (
            <>
              <button className="btn" onClick={() => setShowCharge(true)}>+ Charge</button>
              <button className="btn" onClick={() => setShowPayment(true)}>+ Payment</button>
              <button className="btn btn-danger" onClick={() => setShowDischarge(true)}>
                Discharge
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Days Admitted</p>
          <p className="font-display text-3xl font-semibold text-teal-600">{totalDays}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Total Bill</p>
          <p className="font-display text-3xl font-semibold text-gray-800">
            ₹{totalCharges?.toFixed(0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Total Paid</p>
          <p className="font-display text-3xl font-semibold text-green-600">
            ₹{totalPaid?.toFixed(0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-gray-400 mb-1">Balance Due</p>
          <p className={`font-display text-3xl font-semibold ${
            balanceDue > 0 ? 'text-red-500' : 'text-green-600'
          }`}>
            ₹{Math.abs(balanceDue)?.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Charges and Payments side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Charges */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Charges
              <span className="ml-2 text-xs text-gray-400">({charges?.length || 0})</span>
            </h2>
            {isAdmitted && (
              <button className="btn btn-sm" onClick={() => setShowCharge(true)}>+ Add</button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {charges?.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No charges yet</div>
            ) : charges?.map(c => (
              <div key={c.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.description}</p>
                  <p className="text-xs text-gray-400">
                    {c.chargeType} · {new Date(c.chargeDate).toLocaleDateString('en-IN')}
                    {c.quantity > 1 && ` · ×${c.quantity}`}
                    {c.autoGenerated && ' · Auto'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700">
                    ₹{(c.amount * c.quantity).toFixed(0)}
                  </span>
                  {!c.autoGenerated && isAdmitted && (
                    <button onClick={() => deleteCharge(c.id)}
                      className="text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {charges?.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between">
              <span className="text-xs text-gray-500">Total Charges</span>
              <span className="text-sm font-bold text-gray-800">₹{totalCharges?.toFixed(0)}</span>
            </div>
          )}
        </div>

        {/* Payments */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Payments
              <span className="ml-2 text-xs text-gray-400">({payments?.length || 0})</span>
            </h2>
            {isAdmitted && (
              <button className="btn btn-sm" onClick={() => setShowPayment(true)}>+ Add</button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {payments?.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No payments recorded</div>
            ) : payments?.map(p => (
              <div key={p.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.paymentMode}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(p.paidAt).toLocaleDateString('en-IN')}
                    {p.note && ` · ${p.note}`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  ₹{p.amount?.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
          {payments?.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-between">
              <span className="text-xs text-gray-500">Total Paid</span>
              <span className="text-sm font-bold text-green-600">₹{totalPaid?.toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Balance summary */}
      {balanceDue !== 0 && (
        <div className={`mt-4 p-3 rounded-xl flex items-center justify-between ${
          balanceDue > 0
            ? 'bg-red-50 border border-red-100'
            : 'bg-green-50 border border-green-100'
        }`}>
          <p className={`text-sm font-medium ${balanceDue > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {balanceDue > 0 ? `Balance Due: ₹${balanceDue.toFixed(0)}` : `Overpaid: ₹${Math.abs(balanceDue).toFixed(0)}`}
          </p>
          {isAdmitted && balanceDue > 0 && (
            <button className="btn btn-sm" onClick={() => setShowPayment(true)}>
              Collect Payment
            </button>
          )}
        </div>
      )}

      {/* Add Charge Modal */}
      {showCharge && (
        <Modal title="Add Charge" onClose={() => setShowCharge(false)}>
          <form onSubmit={addCharge} className="space-y-4">
            <div>
              <label className="label">Charge Type *</label>
              <select className="input" value={chargeForm.chargeType}
                onChange={e => setChargeForm(f => ({ ...f, chargeType: e.target.value }))}>
                {CHARGE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description *</label>
              <input className="input" required
                placeholder="e.g. Paracetamol 500mg, Chest X-Ray, Dressing"
                value={chargeForm.description}
                onChange={e => setChargeForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Amount (₹) *</label>
                <input type="number" className="input" required min="0"
                  value={chargeForm.amount}
                  onChange={e => setChargeForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Quantity</label>
                <input type="number" className="input" min="1" value={chargeForm.quantity}
                  onChange={e => setChargeForm(f => ({
                    ...f, quantity: parseInt(e.target.value) || 1
                  }))} />
              </div>
            </div>
            {chargeForm.amount && chargeForm.quantity && (
              <div className="p-3 bg-teal-50 rounded-lg text-center">
                <p className="text-teal-700 font-semibold">
                  Total: ₹{(parseFloat(chargeForm.amount || 0) * (chargeForm.quantity || 1)).toFixed(0)}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowCharge(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Adding...' : 'Add Charge'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Payment Modal */}
      {showPayment && (
        <Modal title="Record Payment" onClose={() => setShowPayment(false)}>
          <form onSubmit={addPayment} className="space-y-4">
            <div>
              <label className="label">Amount (₹) *</label>
              <input type="number" className="input" required min="1"
                placeholder="Enter amount"
                value={paymentForm.amount}
                onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Payment Mode *</label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_MODES.map(m => (
                  <button key={m} type="button"
                    className={`py-2 rounded-lg text-sm border-2 transition-colors ${
                      paymentForm.paymentMode === m
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentForm(f => ({ ...f, paymentMode: m }))}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Note (Optional)</label>
              <input className="input" placeholder="e.g. Partial payment, Final settlement"
                value={paymentForm.note}
                onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowPayment(false)}>Cancel</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Discharge Modal */}
      {showDischarge && (
        <Modal title="Discharge Patient" onClose={() => setShowDischarge(false)}>
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-700">
              Balance due: <strong>₹{balanceDue?.toFixed(0)}</strong> —
              ensure all payments are collected before discharge.
            </p>
          </div>
          <form onSubmit={handleDischarge} className="space-y-4">

            <div>
              <label className="label">
                Discharge Date *
                {dischargeDate && (
                  <span className="ml-2 text-xs text-teal-500 font-normal">
                    ✓ Pre-filled from admission
                  </span>
                )}
              </label>
              <input
                type="date"
                className="input"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dischargeDate}
                onChange={e => setDischargeDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Treatment Summary</label>
              <textarea className="input resize-none" rows={3}
                placeholder="Treatment given during hospital stay..."
                value={dischargeForm.treatmentSummary}
                onChange={e => setDischargeForm(f => ({ ...f, treatmentSummary: e.target.value }))} />
            </div>
            <div>
              <label className="label">Discharge Advice</label>
              <textarea className="input resize-none" rows={2}
                placeholder="Rest, diet, follow-up instructions..."
                value={dischargeForm.dischargeAdvice}
                onChange={e => setDischargeForm(f => ({ ...f, dischargeAdvice: e.target.value }))} />
            </div>
            <div>
              <label className="label">Medicines on Discharge</label>
              <div className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Type medicine and press Add..."
                  value={medicineInput} onChange={e => setMedicineInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMedicine())} />
                <button type="button" className="btn" onClick={addMedicine}>Add</button>
              </div>
              {dischargeForm.medicinesOnDischarge?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dischargeForm.medicinesOnDischarge.map((m, i) => (
                    <span key={i}
                      className="badge badge-active flex items-center gap-1 cursor-pointer"
                      onClick={() => setDischargeForm(f => ({
                        ...f,
                        medicinesOnDischarge: f.medicinesOnDischarge.filter((_, idx) => idx !== i)
                      }))}>
                      {m} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowDischarge(false)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Discharging...' : 'Confirm Discharge'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}