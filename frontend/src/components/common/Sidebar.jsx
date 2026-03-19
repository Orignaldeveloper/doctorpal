import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Sidebar({ navItems, role, roleBadgeClass }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const sidebarContent = (
    <aside className={`
      flex flex-col h-full bg-white border-r border-gray-100
      w-52 flex-shrink-0
    `}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl text-teal-600">DoctorPal</div>
            <div className="text-xs text-gray-400 mt-0.5">Clinic Management</div>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>
        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass}`}>
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.label} className="mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-1">
              {section.label}
            </p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-semibold flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full text-xs text-gray-400 hover:text-red-500 py-1 transition-colors text-left px-2"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile hamburger button — fixed top left */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slides in from left */}
      {isOpen && (
        <>
          {/* Dark overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="md:hidden fixed top-0 left-0 h-full z-50 shadow-xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}