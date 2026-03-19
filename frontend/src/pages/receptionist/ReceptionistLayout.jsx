import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'

const navItems = [
  {
    label: 'Work',
    items: [
      { to: '/receptionist',       end: true, icon: '✚', label: 'Add Patient' },
      { to: '/receptionist/queue',           icon: '☰', label: "Today's Queue" },
    ],
  },
]

export default function ReceptionistLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Receptionist" roleBadgeClass="bg-blue-50 text-blue-700" />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}