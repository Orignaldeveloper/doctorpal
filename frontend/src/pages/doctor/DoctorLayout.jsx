import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'

const navItems = [
  {
    label: 'OPD',
    icon: '🏨',
    items: [
      { to: '/doctor',           end: true, icon: '⚡', label: 'Live Queue' },
      { to: '/doctor/patients',             icon: '👥', label: 'Patient History' },
      { to: '/doctor/reports',              icon: '📊', label: 'Reports' },
    ],
  },
  {
    label: 'IPD',
    icon: '🏥',
    items: [
      { to: '/doctor/ipd', end: true,        icon: '📋', label: 'IPD Dashboard' },
      { to: '/doctor/ipd/beds',             icon: '🛏', label: 'Bed Management' },
      { to: '/doctor/ipd/admit',            icon: '➕', label: 'Admit Patient' },
      { to: '/doctor/ipd/discharged',       icon: '📂', label: 'Discharged History' },
    ],
  },
  {
    label: 'Documents',
    icon: '📁',
    items: [
      { to: '/doctor/fitness',              icon: '💪', label: 'Fitness Certificate' },
      { to: '/doctor/letterhead',           icon: '🖨', label: 'Clinic Template' },
    ],
  },
  {
    label: 'Manage',
    icon: '⚙️',
    items: [
      { to: '/doctor/receptionists',        icon: '👩‍💼', label: 'Receptionists' },
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