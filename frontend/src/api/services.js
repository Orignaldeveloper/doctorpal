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
