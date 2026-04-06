import { useEffect, useState, useRef } from 'react'
import { ipdAPI, templateAPI } from '../../../api/services'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function BillPrint() {
  const { admissionId } = useParams()
  const navigate        = useNavigate()
  const [bill, setBill]           = useState(null)
  const [template, setTemplate]   = useState(null)
  const [useHeader, setUseHeader] = useState(true)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([ipdAPI.getBill(admissionId), templateAPI.getLetterhead()])
      .then(([b, t]) => { setBill(b.data.data); setTemplate(t.data.data) })
      .catch(() => toast.error('Failed to load bill'))
      .finally(() => setLoading(false))
  }, [admissionId])

  if (loading) return <div className="p-6 text-gray-400">Loading bill...</div>
  if (!bill)   return <div className="p-6 text-gray-400">Bill not found</div>

  const { admission, charges, payments, totalCharges, totalPaid, balanceDue, totalDays } = bill

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : '—'

  return (
    <div className="p-6">

      {/* Controls — hidden on print */}
      <div className="flex items-center gap-3 mb-6 print:hidden flex-wrap">
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        <button className="btn" onClick={() => navigate(`/doctor/ipd/${admissionId}`)}>
          Patient Details
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={useHeader}
            onChange={e => setUseHeader(e.target.checked)} />
          Print with clinic header
        </label>
        <div className="flex-1" />
        {!template?.clinicName && (
          <button className="btn text-amber-600 border-amber-300"
            onClick={() => navigate('/doctor/letterhead')}>
            ⚠ Setup Clinic Template First
          </button>
        )}
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {/* Bill Print Area */}
      <div id="bill-print" className="bg-white max-w-3xl mx-auto shadow-sm border border-gray-200 p-10">
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #bill-print, #bill-print * { visibility: visible !important; }
            #bill-print { position: fixed; left: 0; top: 0; width: 100%; padding: 30px; border: none; box-shadow: none; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>

        {/* Clinic Header */}
        {useHeader && template?.clinicName ? (
          <div className="pb-5 mb-6" style={{ borderBottom: '2px solid #1a1a1a' }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{template.clinicName}</h1>
                <p className="text-sm text-gray-700 mt-0.5">
                  {template.doctorName}
                  {template.qualification && ` — ${template.qualification}`}
                </p>
                {template.specialization && (
                  <p className="text-xs text-gray-500 mt-0.5">{template.specialization}</p>
                )}
                {template.registrationNumber && (
                  <p className="text-xs text-gray-500">Reg. No: {template.registrationNumber}</p>
                )}
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                {template.clinicAddress && <p>{template.clinicAddress}</p>}
                {template.city && (
                  <p>{template.city}{template.state && `, ${template.state}`} {template.pincode}</p>
                )}
                {template.phone && <p>Ph: {template.phone}</p>}
                {template.email && <p>{template.email}</p>}
                {template.timings && <p>Timings: {template.timings}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-24 mb-6" style={{ borderBottom: '2px solid #1a1a1a' }} />
        )}

        {/* Bill Title */}
        <div className="text-center mb-7">
          <h2 className="text-xl font-bold tracking-widest uppercase">
            {admission.status === 'DISCHARGED' ? 'Discharge Bill' : 'Provisional Bill'}
          </h2>
          <div className="flex justify-center gap-6 mt-1">
            <p className="text-xs text-gray-400">
              Bill Date: {fmtDate(new Date())}
            </p>
            {admission.billNumber && (
              <p className="text-xs font-bold text-gray-700">
                Bill No: {admission.billNumber}
              </p>
            )}
          </div>
        </div>

        {/* Patient Info Box */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-lg bg-gray-50 text-sm">
          {[
            ['Patient Name', admission.patientName],
            ['Age / Gender', `${admission.patientAge} yrs / ${admission.patientGender}`],
            ['Phone', admission.patientPhone],
            ['Blood Group', admission.bloodGroup || '—'],
            ['Address', admission.patientAddress || '—', true],
            ['Diagnosis', admission.diagnosis, true],
            ['Admission Date', fmtDate(admission.admissionDate)],
            ['Discharge Date', fmtDate(admission.dischargeDate)],
            ['Total Days', `${totalDays} day${totalDays > 1 ? 's' : ''}`],
          ].map(([label, value, full]) => (
            <div key={label} className={full ? 'col-span-2' : ''}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        {/* Charges Table */}
        <table className="w-full text-sm mb-1 border-collapse">
          <thead>
            <tr style={{ background: '#1a1a1a', color: 'white' }}>
              {['Description', 'Type', 'Date', 'Qty', 'Rate (₹)', 'Amount (₹)'].map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {charges?.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9' }}>
                <td className="px-3 py-1.5 text-gray-800">{c.description}</td>
                <td className="px-3 py-1.5 text-gray-500 text-xs">{c.chargeType}</td>
                <td className="px-3 py-1.5 text-gray-500 text-xs">
                  {new Date(c.chargeDate).toLocaleDateString('en-IN')}
                </td>
                <td className="px-3 py-1.5 text-right">{c.quantity}</td>
                <td className="px-3 py-1.5 text-right">{c.amount?.toFixed(0)}</td>
                <td className="px-3 py-1.5 text-right font-medium">
                  {(c.amount * c.quantity)?.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bill Summary */}
        <div className="flex justify-end mb-6 mt-2">
          <div className="w-60 text-sm">
            <div className="flex justify-between py-1.5 border-t border-gray-200">
              <span className="text-gray-600">Total Charges</span>
              <span className="font-semibold">₹{totalCharges?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-green-700">
              <span>Total Paid</span>
              <span className="font-semibold">₹{totalPaid?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between py-2 text-base font-bold"
              style={{ borderTop: '2px solid #1a1a1a' }}>
              <span>Balance Due</span>
              <span style={{ color: balanceDue > 0 ? '#dc2626' : '#16a34a' }}>
                ₹{balanceDue?.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {payments?.length > 0 && (
          <div className="mb-6 text-xs text-gray-600">
            <p className="font-semibold uppercase tracking-wide mb-1">Payment History</p>
            <div className="flex flex-wrap gap-3">
              {payments.map(p => (
                <span key={p.id}>
                  ₹{p.amount?.toFixed(0)} via {p.paymentMode}
                  {p.note && ` (${p.note})`} on {new Date(p.paidAt).toLocaleDateString('en-IN')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Discharge Summary */}
        {admission.treatmentSummary && (
          <div className="mb-6 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Treatment Summary</p>
            <p className="text-gray-600">{admission.treatmentSummary}</p>
          </div>
        )}
        {admission.dischargeAdvice && (
          <div className="mb-6 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Discharge Advice</p>
            <p className="text-gray-600">{admission.dischargeAdvice}</p>
          </div>
        )}
        {admission.medicinesOnDischarge?.length > 0 && (
          <div className="mb-6 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Medicines on Discharge</p>
            <div className="flex flex-wrap gap-2">
              {admission.medicinesOnDischarge.map((m, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs">
                  {i + 1}. {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-end mt-10 pt-4"
          style={{ borderTop: '2px solid #1a1a1a' }}>
          <div className="text-xs text-gray-400">
            {template?.footerNote || 'Thank you for choosing our clinic.'}
          </div>
          <div className="text-center">
            <div className="w-44 pt-1 text-xs text-gray-600"
              style={{ borderTop: '1px solid #9ca3af' }}>
              {template?.signatureText || template?.doctorName || 'Doctor Signature'}
            </div>
            {template?.qualification && (
              <p className="text-xs text-gray-400 mt-0.5">{template.qualification}</p>
            )}
            {template?.registrationNumber && (
              <p className="text-xs text-gray-400">Reg. No: {template.registrationNumber}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}