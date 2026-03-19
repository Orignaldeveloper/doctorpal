import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'

const navItems = [
  {
    label: 'Platform',
    items: [
      { to: '/admin', end: true, icon: '◈', label: 'Overview' },
      { to: '/admin/doctors',      icon: '⚕', label: 'Doctors' },
      { to: '/admin/stats',        icon: '▦', label: 'Statistics' },
      { to: '/admin/super-admins', icon: '★', label: 'Super Admins' },
    ],
  },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Super Admin" roleBadgeClass="bg-amber-50 text-amber-700" />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}