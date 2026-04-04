import { useEffect, useState } from 'react'
import { templateAPI } from '../../api/services'
import toast from 'react-hot-toast'

const EMPTY = {
  clinicName: '', doctorName: '', qualification: '', registrationNumber: '',
  specialization: '', clinicAddress: '', city: '', state: '', pincode: '',
  phone: '', email: '', timings: '', signatureText: '', footerNote: '',
  showLogo: false, showWithHeader: true, showWithoutHeader: true
}

export default function ClinicLetterhead() {
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(false)
  const set = (k, v)          => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    templateAPI.getLetterhead()
      .then(r => { if (r.data.data?.clinicName) setForm({ ...EMPTY, ...r.data.data }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await templateAPI.saveLetterhead(form)
      toast.success('Clinic template saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Clinic Template</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure your clinic letterhead for bills and certificates
          </p>
        </div>
        <button className="btn" onClick={() => setPreview(!preview)}>
          {preview ? '👁 Hide Preview' : '👁 Show Preview'}
        </button>
      </div>

      {/* Live Preview */}
      {preview && (
        <div className="card p-6 mb-6 border-2 border-teal-100">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
            Header Preview
          </p>
          <div className="pb-4" style={{ borderBottom: '2px solid #1a1a1a' }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {form.clinicName || 'Your Clinic Name'}
                </h1>
                <p className="text-sm text-gray-600">
                  {form.doctorName || 'Dr. Your Name'}
                  {form.qualification && ` — ${form.qualification}`}
                </p>
                {form.specialization && (
                  <p className="text-xs text-gray-500">{form.specialization}</p>
                )}
                {form.registrationNumber && (
                  <p className="text-xs text-gray-500">Reg. No: {form.registrationNumber}</p>
                )}
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                {form.clinicAddress && <p>{form.clinicAddress}</p>}
                {form.city && <p>{form.city}{form.state && `, ${form.state}`} {form.pincode}</p>}
                {form.phone && <p>Ph: {form.phone}</p>}
                {form.email && <p>{form.email}</p>}
                {form.timings && <p>{form.timings}</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <p className="text-xs text-gray-400">
              {form.footerNote || 'Thank you for choosing our clinic.'}
            </p>
            <div className="text-center">
              <div className="w-32 pt-1 text-xs text-gray-500"
                style={{ borderTop: '1px solid #9ca3af' }}>
                {form.signatureText || form.doctorName || 'Signature'}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">

        {/* Clinic Info */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
            Clinic Information
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Clinic Name *</label>
              <input className="input" required value={form.clinicName}
                onChange={e => set('clinicName', e.target.value)} />
            </div>
            <div>
              <label className="label">Doctor Name *</label>
              <input className="input" required value={form.doctorName}
                onChange={e => set('doctorName', e.target.value)} />
            </div>
            <div>
              <label className="label">Qualification</label>
              <input className="input" placeholder="e.g. MBBS, MD, MS"
                value={form.qualification} onChange={e => set('qualification', e.target.value)} />
            </div>
            <div>
              <label className="label">Registration Number *</label>
              <input className="input" placeholder="Medical council registration number"
                value={form.registrationNumber}
                onChange={e => set('registrationNumber', e.target.value)} />
            </div>
            <div>
              <label className="label">Specialization</label>
              <input className="input" placeholder="e.g. General Physician, Surgeon"
                value={form.specialization}
                onChange={e => set('specialization', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" value={form.phone}
                onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Clinic Timings</label>
              <input className="input" placeholder="e.g. Mon-Sat 9am-7pm"
                value={form.timings} onChange={e => set('timings', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Clinic Address</label>
              <input className="input" placeholder="Full address"
                value={form.clinicAddress}
                onChange={e => set('clinicAddress', e.target.value)} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city}
                onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" value={form.state}
                onChange={e => set('state', e.target.value)} />
            </div>
            <div>
              <label className="label">Pincode</label>
              <input className="input" value={form.pincode}
                onChange={e => set('pincode', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">
            Footer & Signature
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Signature Text</label>
              <input className="input" placeholder="e.g. Dr. Priya Sharma"
                value={form.signatureText}
                onChange={e => set('signatureText', e.target.value)} />
            </div>
            <div>
              <label className="label">Footer Note</label>
              <input className="input"
                placeholder="e.g. Thank you for choosing our clinic"
                value={form.footerNote}
                onChange={e => set('footerNote', e.target.value)} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary w-full py-3 text-base">
          {saving ? 'Saving...' : '💾 Save Clinic Template'}
        </button>
      </form>
    </div>
  )
}