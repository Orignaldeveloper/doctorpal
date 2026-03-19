import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'

const navItems = [
  {
    label: 'Clinic',
    items: [
      { to: '/doctor',              end: true, icon: '⚡', label: 'Live Queue' },
      { to: '/doctor/patients',             icon: '👤', label: 'Patient History' },
      { to: '/doctor/reports',              icon: '▦',  label: 'Reports' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/doctor/receptionists', icon: '⊞', label: 'Receptionists' },
    ],
  },
]

export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Doctor" roleBadgeClass="bg-teal-50 text-teal-700" />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}