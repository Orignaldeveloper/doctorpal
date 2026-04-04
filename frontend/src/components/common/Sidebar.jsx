import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Sidebar({ navItems, role, roleBadgeClass }) {
  const { user, logout } = useAuth()
  const themeCtx = useTheme()
  const THEMES = themeCtx?.THEMES || []
  const themeColor = themeCtx?.themeColor || '#0F9E7B'
  const changeTheme = themeCtx?.changeTheme || (() => {})
  const [showThemePicker, setShowThemePicker] = useState(false)
  const navigate         = useNavigate()
  const location         = useLocation()
  const [isOpen, setIsOpen]       = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Auto-expand section based on current route
  const getActiveSection = () => {
    for (const section of navItems) {
      for (const item of section.items) {
        if (item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to)) {
          return section.label
        }
      }
    }
    return navItems[0]?.label || ''
  }

  const [openSection, setOpenSection] = useState(() => getActiveSection())

  // Update open section when route changes
  useEffect(() => {
    setOpenSection(getActiveSection())
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setIsOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const toggleSection = (label) => {
    setOpenSection(prev => prev === label ? '' : label)
  }

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 flex-shrink-0"
      style={{ background: '#F8F9FC' }}>

      {/* Logo */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🏥</span>
            </div>
            <div>
              <div className="font-bold text-gray-800 text-base leading-tight">DoctorPal</div>
              <div className="text-xs text-gray-400">Clinic Management</div>
            </div>
          </div>
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
          <button
            className="hidden md:flex p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-teal-600 transition-colors"
            onClick={() => setCollapsed(true)}
          >
            ←
          </button>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          {role}
        </div>
      </div>

      {/* Accordion Nav */}
      <nav className="flex-1 py-2 overflow-y-auto px-3 space-y-1">
        {navItems.map((section) => {
          const isExpanded = openSection === section.label

          // Check if any item in this section is active
          const hasActive = section.items.some(item =>
            item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
          )

          return (
            <div key={section.label} className="mb-1">
           {/* Section Header — clickable */}
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  hasActive
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    hasActive ? 'bg-white shadow-sm' : 'bg-gray-100'
                  }`}>
                    {section.icon}
                  </div>
                  <span className={`text-sm font-semibold ${
                    hasActive ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {section.label}
                  </span>
                </div>
                <span className={`text-gray-400 text-xs transition-transform duration-300 ${
                  isExpanded ? 'rotate-90' : ''
                }`}>
                  ›
                </span>
              </button>

              {/* Section Items — accordion */}
              {isExpanded && (
                <div className="mt-1 mb-2 ml-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                          isActive
                            ? 'text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                        }`
                      }
                      style={({ isActive }) => isActive ? { background: 'var(--primary)' } : {}}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                            isActive ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      {/* Theme Picker */}
      {user?.role === 'DOCTOR' && (
        <div className="px-3 mb-2">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 text-xs font-medium"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ background: themeColor }} />
            <span>App Theme</span>
            <span className="ml-auto text-gray-300">›</span>
          </button>

          {showThemePicker && (
            <div className="mt-2 p-3 bg-white rounded-xl shadow-sm">
              <p className="text-xs text-gray-400 mb-2 font-medium">Choose your theme color</p>
              <div className="flex gap-2 flex-wrap">
                {THEMES.map(t => (
                  <button
                    key={t.color}
                    onClick={() => { changeTheme(t.color); setShowThemePicker(false) }}
                    className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{ background: t.color }}
                    title={t.name}
                  >
                    {themeColor === t.color && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User */}
      <div className="p-3 m-3 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
            title="Sign out"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Desktop collapsed toggle */}
      {collapsed && (
        <button
          className="hidden md:flex fixed top-3 left-3 z-50 p-2.5 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600 hover:text-teal-600 transition-colors items-center gap-1.5 text-sm"
          onClick={() => setCollapsed(false)}
        >
          ☰ <span className="text-xs font-medium">Menu</span>
        </button>
      )}

      {/* Desktop full sidebar */}
      {!collapsed && (
        <div className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0">
          {sidebarContent}
        </div>
      )}

      {/* Mobile slide-in */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed top-0 left-0 h-full z-50 shadow-xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}