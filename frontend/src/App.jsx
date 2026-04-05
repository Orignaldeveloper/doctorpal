import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminStats from './pages/admin/AdminStats'
import AdminSuperAdmins from './pages/admin/AdminSuperAdmins'
import DoctorLayout from './pages/doctor/DoctorLayout'
import DoctorQueue from './pages/doctor/DoctorQueue'
import DoctorPatients from './pages/doctor/DoctorPatients'
import DoctorReceptionists from './pages/doctor/DoctorReceptionists'
import DoctorReports from './pages/doctor/DoctorReports'
import IpdDashboard from './pages/doctor/ipd/IpdDashboard'
import BedManagement from './pages/doctor/ipd/BedManagement'
import AdmitPatient from './pages/doctor/ipd/AdmitPatient'
import PatientDetail from './pages/doctor/ipd/PatientDetail'
import BillPrint from './pages/doctor/ipd/BillPrint'
import DischargedHistory from './pages/doctor/ipd/DischargedHistory'
import FitnessCertificatePage from './pages/doctor/FitnessCertificate'
import ClinicLetterhead from './pages/doctor/ClinicLetterhead'
import ReceptionistLayout from './pages/receptionist/ReceptionistLayout'
import AddPatient from './pages/receptionist/AddPatient'
import TodayQueue from './pages/receptionist/TodayQueue'

// Full screen loading spinner
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '12px',
      background: '#f9fafb'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid #E1F5EE',
        borderTop: '3px solid #0F6E56',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading DoctorPal...</p>
    </div>
  )
}

function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth()

  // Show spinner while checking auth — never flash blank or redirect too early
  if (loading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'SUPER_ADMIN')  return <Navigate to="/admin" replace />
  if (user.role === 'DOCTOR')       return <Navigate to="/doctor" replace />
  if (user.role === 'RECEPTIONIST') return <Navigate to="/receptionist" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Super Admin */}
        <Route path="/admin" element={
          <RoleRoute roles={['SUPER_ADMIN']}>
            <AdminLayout />
          </RoleRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="super-admins" element={<AdminSuperAdmins />} />
        </Route>

        {/* Doctor */}
        <Route path="/doctor" element={
          <RoleRoute roles={['DOCTOR']}>
            <DoctorLayout />
          </RoleRoute>
        }>
          <Route index element={<DoctorQueue />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="receptionists" element={<DoctorReceptionists />} />
          <Route path="reports" element={<DoctorReports />} />
          <Route path="ipd" element={<IpdDashboard />} />
          <Route path="ipd/beds" element={<BedManagement />} />
          <Route path="ipd/admit" element={<AdmitPatient />} />
          <Route path="ipd/:admissionId" element={<PatientDetail />} />
          <Route path="ipd/:admissionId/bill" element={<BillPrint />} />
          <Route path="ipd/discharged" element={<DischargedHistory />} />
          <Route path="fitness" element={<FitnessCertificatePage />} />
          <Route path="letterhead" element={<ClinicLetterhead />} />
        </Route>

        {/* Receptionist */}
        <Route path="/receptionist" element={
          <RoleRoute roles={['RECEPTIONIST']}>
            <ReceptionistLayout />
          </RoleRoute>
        }>
          <Route index element={<AddPatient />} />
          <Route path="queue" element={<TodayQueue />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}