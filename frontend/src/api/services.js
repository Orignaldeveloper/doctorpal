import api from './axios'

// ── AUTH ──────────────────────────────────────────────────────────
export const authAPI = {
  login: (data)  => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
}

// ── SUPER ADMIN ───────────────────────────────────────────────────
export const adminAPI = {
  getDoctors:          ()           => api.get('/admin/doctors'),
  createDoctor:        (data)       => api.post('/admin/doctors', data),
  updateDoctor:        (id, data)   => api.put(`/admin/doctors/${id}`, data),
  updateDoctorStatus:  (id, status) => api.patch(`/admin/doctors/${id}/status?status=${status}`),
  getStats:            ()           => api.get('/admin/stats'),
  getSuperAdmins:      ()           => api.get('/admin/super-admins'),
  createSuperAdmin:    (data)       => api.post('/admin/super-admins', data),
  updateSuperAdminStatus: (id, status) => api.patch(`/admin/super-admins/${id}/status?status=${status}`),
}

// ── DOCTOR ────────────────────────────────────────────────────────
export const doctorAPI = {
  // Queue
  getQueue:           ()              => api.get('/doctor/queue'),
  nextPatient:        ()              => api.post('/doctor/queue/next'),
  updateVisitStatus:  (id, status)    => api.patch(`/doctor/visits/${id}/status?status=${status}`),
  deleteVisit:        (id)            => api.delete(`/doctor/visits/${id}`),
  // Patients
  searchPatients:     (q)             => api.get(`/doctor/patients${q ? `?q=${q}` : ''}`),
  getPatientHistory:  (patientId)     => api.get(`/doctor/patients/${patientId}/history`),
  // Receptionists
  getReceptionists:   ()              => api.get('/doctor/receptionists'),
  createReceptionist: (data)          => api.post('/doctor/receptionists', data),
  toggleReceptionist: (userId)        => api.patch(`/doctor/receptionists/${userId}/toggle`),
  // Reports
  dailyReport:        ()              => api.get('/doctor/reports/daily'),
  weeklyReport:       ()              => api.get('/doctor/reports/weekly'),
  monthlyReport:      ()              => api.get('/doctor/reports/monthly'),
}

// ── RECEPTIONIST ──────────────────────────────────────────────────
export const receptionistAPI = {
  addPatient:   (data)  => api.post('/receptionist/patient-entry', data),
  getTodayQueue: ()     => api.get('/receptionist/today-queue'),
  lookupPatient: (phone) => api.get(`/receptionist/lookup?phone=${phone}`),
  reQueuePatient: (visitId) => api.post(`/receptionist/requeue/${visitId}`),
}

// ── IPD ───────────────────────────────────────────────────────────
export const ipdAPI = {
  getBeds:          ()              => api.get('/ipd/beds'),
  createBed:        (data)          => api.post('/ipd/beds', data),
  updateBed:        (id, data)      => api.put(`/ipd/beds/${id}`, data),
  updateBedStatus:  (id, status)    => api.patch(`/ipd/beds/${id}/status?status=${status}`),
  admitPatient:     (data)          => api.post('/ipd/admit', data),
  getAdmitted:      ()              => api.get('/ipd/admitted'),
  getAllAdmissions:  ()              => api.get('/ipd/admissions'),
  addCharge:        (data)          => api.post('/ipd/charges', data),
  deleteCharge:     (id)            => api.delete(`/ipd/charges/${id}`),
  addPayment:       (data)          => api.post('/ipd/payments', data),
  getBill:          (admissionId)   => api.get(`/ipd/bill/${admissionId}`),
  discharge:        (data)          => api.post('/ipd/discharge', data),
  updateAdmission:  (id, data)      => api.put(`/ipd/admissions/${id}`, data),
}

// ── TEMPLATE & FITNESS ────────────────────────────────────────────
export const templateAPI = {
  getLetterhead:     ()           => api.get('/template/letterhead'),
  saveLetterhead:    (data)       => api.post('/template/letterhead', data),
  getCertificates:   ()           => api.get('/template/fitness'),
  getCertificate:    (id)         => api.get(`/template/fitness/${id}`),
  createCertificate: (data)       => api.post('/template/fitness', data),
  updateCertificate: (id, data)   => api.put(`/template/fitness/${id}`, data),
  deleteCertificate: (id)         => api.delete(`/template/fitness/${id}`),
}