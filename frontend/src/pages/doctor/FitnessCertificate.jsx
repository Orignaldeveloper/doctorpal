import { useEffect, useState } from 'react'
import { templateAPI } from '../../api/services'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const FITNESS_TYPES = [
  { value: 'FIT_TO_JOIN_DUTY',       label: 'Fit to Join Duty' },
  { value: 'FIT_TO_TRAVEL',          label: 'Fit to Travel' },
  { value: 'RECOVERED_FROM_ILLNESS', label: 'Recovered from Illness' },
  { value: 'CUSTOM',                 label: 'Custom Statement' },
]

const EMPTY = {
  patientName: '', patientAge: '', patientGender: 'Male', patientAddress: '',
  fitnessType: 'FIT_TO_JOIN_DUTY', customStatement: '',
  diagnosis: '', remarks: '', validTill: ''
}

const getFitnessText = (cert) => {
  switch (cert.fitnessType) {
    case 'FIT_TO_JOIN_DUTY':
      return `This is to certify that ${cert.patientName}, aged ${cert.patientAge} years (${cert.patientGender}), has been examined by me and is found to be medically fit to join duty.`
    case 'FIT_TO_TRAVEL':
      return `This is to certify that ${cert.patientName}, aged ${cert.patientAge} years (${cert.patientGender}), has been examined by me and is found to be medically fit to travel.`
    case 'RECOVERED_FROM_ILLNESS':
      return `This is to certify that ${cert.patientName}, aged ${cert.patientAge} years (${cert.patientGender}), was suffering from ${cert.diagnosis || 'illness'} and has now fully recovered and is in good health.`
    case 'CUSTOM':
      return cert.customStatement || ''
    default: return ''
  }
}

export default function FitnessCertificatePage() {
  const [certs, setCerts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editCert, setEditCert]     = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [printCert, setPrintCert]   = useState(null)
  const [template, setTemplate]     = useState(null)
  const [useHeader, setUseHeader]   = useState(true)
  const navigate                    = useNavigate()
  const set = (k, v)                => setForm(f => ({ ...f, [k]: v }))

  const load = () => {
    Promise.all([templateAPI.getCertificates(), templateAPI.getLetterhead()])
      .then(([c, t]) => { setCerts(c.data.data || []); setTemplate(t.data.data) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setForm(EMPTY); setEditCert(null); setShowModal(true) }
  const openEdit   = (c) => {
    setForm({
      patientName: c.patientName, patientAge: c.patientAge,
      patientGender: c.patientGender, patientAddress: c.patientAddress || '',
      fitnessType: c.fitnessType, customStatement: c.customStatement || '',
      diagnosis: c.diagnosis || '', remarks: c.remarks || '',
      validTill: c.validTill ? c.validTill.split('T')[0] : ''
    })
    setEditCert(c); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, patientAge: parseInt(form.patientAge) }
      editCert
        ? await templateAPI.updateCertificate(editCert.id, payload)
        : await templateAPI.createCertificate(payload)
      toast.success(editCert ? 'Certificate updated' : 'Certificate created')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const deleteCert = async (id) => {
    if (!confirm('Delete this certificate?')) return
    try { await templateAPI.deleteCertificate(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Fitness Certificates</h1>
          <p className="text-sm text-gray-400 mt-1">Create and print medical fitness certificates</p>
        </div>
        <div className="flex gap-2">
          {!template?.clinicName && (
            <button className="btn text-amber-600 border-amber-300"
              onClick={() => navigate('/doctor/letterhead')}>
              ⚙ Setup Template First
            </button>
          )}
          <button className="btn btn-primary" onClick={openCreate}>+ New Certificate</button>
        </div>
      </div>

      {/* Certificate List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : certs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">No certificates yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first fitness certificate</p>
            <button className="btn btn-primary mt-4" onClick={openCreate}>
              + Create Certificate
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Patient', 'Type', 'Diagnosis', 'Date', 'Valid Till', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{c.patientName}</div>
                    <div className="text-xs text-gray-400">
                      {c.patientAge} yrs · {c.patientGender}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-active text-xs">
                      {FITNESS_TYPES.find(f => f.value === c.fitnessType)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.diagnosis || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.certificateDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.validTill ? new Date(c.validTill).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm" onClick={() => setPrintCert(c)}>
                        🖨 Print
                      </button>
                      <button className="btn btn-sm btn-danger"
                        onClick={() => deleteCert(c.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal
          title={editCert ? 'Edit Fitness Certificate' : 'New Fitness Certificate'}
          onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Patient Name *</label>
                <input className="input" required value={form.patientName}
                  onChange={e => set('patientName', e.target.value)} />
              </div>
              <div>
                <label className="label">Age *</label>
                <input type="number" className="input" required min="1"
                  value={form.patientAge} onChange={e => set('patientAge', e.target.value)} />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select className="input" value={form.patientGender}
                  onChange={e => set('patientGender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" value={form.patientAddress}
                  onChange={e => set('patientAddress', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Certificate Type *</label>
                <select className="input" value={form.fitnessType}
                  onChange={e => set('fitnessType', e.target.value)}>
                  {FITNESS_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {form.fitnessType === 'CUSTOM' && (
                <div className="col-span-2">
                  <label className="label">Custom Statement *</label>
                  <textarea className="input resize-none" rows={3}
                    placeholder="Write your custom fitness statement..."
                    value={form.customStatement}
                    onChange={e => set('customStatement', e.target.value)} />
                </div>
              )}
              <div className="col-span-2">
                <label className="label">Diagnosis / Illness</label>
                <input className="input" placeholder="Optional — used in recovered statement"
                  value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
              </div>
              <div>
                <label className="label">Valid Till</label>
                <input type="date" className="input" value={form.validTill}
                  onChange={e => set('validTill', e.target.value)} />
              </div>
              <div>
                <label className="label">Remarks</label>
                <input className="input" placeholder="Optional"
                  value={form.remarks} onChange={e => set('remarks', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : editCert ? 'Update' : 'Create Certificate'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Print Preview */}
      {printCert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setPrintCert(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Controls */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 print:hidden sticky top-0 bg-white z-10">
              <h2 className="font-semibold flex-1 text-gray-800">Certificate Preview</h2>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={useHeader}
                  onChange={e => setUseHeader(e.target.checked)} />
                With header
              </label>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                🖨 Print
              </button>
              <button className="btn btn-sm" onClick={() => setPrintCert(null)}>✕ Close</button>
            </div>

            {/* Certificate */}
            <div className="p-10" id="cert-area">
              <style>{`
                @media print {
                  body * { visibility: hidden !important; }
                  #cert-area, #cert-area * { visibility: visible !important; }
                  #cert-area { position: fixed; left: 0; top: 0; width: 100%; padding: 40px; }
                  .print\\:hidden { display: none !important; }
                }
              `}</style>

              {/* Header */}
              {useHeader && template?.clinicName ? (
                <div className="pb-4 mb-6" style={{ borderBottom: '2px solid #1a1a1a' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{template.clinicName}</h1>
                      <p className="text-sm text-gray-700">
                        {template.doctorName}
                        {template.qualification && ` — ${template.qualification}`}
                      </p>
                      {template.specialization && (
                        <p className="text-xs text-gray-500">{template.specialization}</p>
                      )}
                      {template.registrationNumber && (
                        <p className="text-xs text-gray-500">
                          Reg. No: {template.registrationNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500 space-y-0.5">
                      {template.clinicAddress && <p>{template.clinicAddress}</p>}
                      {template.city && (
                        <p>{template.city}{template.state && `, ${template.state}`}</p>
                      )}
                      {template.phone && <p>Ph: {template.phone}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-20 mb-6" style={{ borderBottom: '2px solid #1a1a1a' }} />
              )}

              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="inline-block text-xl font-bold uppercase tracking-widest px-10 py-2"
                  style={{ borderTop: '2px solid #1a1a1a', borderBottom: '2px solid #1a1a1a' }}>
                  Fitness Certificate
                </h2>
              </div>

              {/* Cert number and date */}
              <div className="flex justify-between text-xs text-gray-500 mb-6">
                <span>Cert. No: {printCert.id?.slice(-8).toUpperCase()}</span>
                <span>Date: {new Date(printCert.certificateDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}</span>
              </div>

              <p className="text-sm text-gray-700 mb-5 font-medium">To Whom It May Concern,</p>

              {/* Main Statement */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-gray-800 leading-relaxed text-sm"
                style={{ borderLeft: '3px solid #1a1a1a' }}>
                {getFitnessText(printCert)}
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-2 mb-5 text-sm">
                {[
                  ['Patient Name', printCert.patientName],
                  ['Age / Gender', `${printCert.patientAge} yrs / ${printCert.patientGender}`],
                  printCert.patientAddress && ['Address', printCert.patientAddress],
                  printCert.diagnosis && ['Diagnosis', printCert.diagnosis],
                  printCert.validTill && ['Valid Till', new Date(printCert.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label}>
                    <span className="text-gray-500">{label}: </span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              {printCert.remarks && (
                <p className="text-sm text-gray-600 mb-5">
                  <strong>Remarks:</strong> {printCert.remarks}
                </p>
              )}

              {/* Footer */}
              <div className="flex justify-between items-end mt-12 pt-4"
                style={{ borderTop: '2px solid #1a1a1a' }}>
                <p className="text-xs text-gray-400 max-w-xs">
                  {template?.footerNote ||
                    'This certificate is issued on the basis of medical examination.'}
                </p>
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
        </div>
      )}
    </div>
  )
}