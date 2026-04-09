import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { PawPrint, LayoutDashboard, Heart, Stethoscope, User, LogOut, MapPin, Sun, Moon, X, Mail } from 'lucide-react'
import { useTheme } from '../ThemeContext'
import { useAuth } from '../AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pets', label: 'Pets', icon: Heart },
  { to: '/vets', label: 'Vets', icon: Stethoscope },
  { to: '/help-map', label: 'Help Map', icon: MapPin },
]

function NavItem({ to, label, icon: Icon, end }) {
  const { theme } = useTheme()
  return (
    <NavLink
      to={to}
      end={end ?? to === '/'}
      className={({ isActive }) =>
        [
          'group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
          isActive
            ? 'nav-item-active'
            : 'nav-item-inactive hover:scale-105',
        ].join(' ')
      }
      style={({ isActive }) => 
        isActive 
          ? {} 
          : { color: theme === 'dark' ? '#f1f5f9' : '#0f172a' }
      }
    >
      <Icon className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" strokeWidth={2} />
      {label}
    </NavLink>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full theme-toggle-btn transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <Sun className={`w-5 h-5 text-warm-500 transition-all duration-300 ${theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'} absolute inset-0 m-auto`} />
      <Moon className={`w-5 h-5 text-sky-400 transition-all duration-300 ${theme === 'light' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} />
    </button>
  )
}

function ProfileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme } = useTheme()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`font-display text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Profile
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-slate-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <User className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>

            {/* Name */}
            <h3 className={`font-display text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {user?.name || 'User'}
            </h3>

            {/* Email */}
            <div className={`flex items-center gap-2 mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user?.email || 'No email'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 space-y-2">
            <Link
              to="/profile"
              onClick={onClose}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-800 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Edit Profile</span>
            </Link>
            <Link
              to="/reminders"
              onClick={onClose}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-800 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
              }`}
            >
              <PawPrint className="w-5 h-5" />
              <span className="font-medium">My Reminders</span>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </div>
    </>
  )
}

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <>
      <header className="sticky top-0 z-40 glass-navbar transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
            >
              <span className="navbar-logo flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl">
                <PawPrint className="w-5 h-5" strokeWidth={2.2} />
              </span>
              <div className="hidden sm:block">
                <p className="navbar-title font-display text-lg font-bold tracking-tight transition-colors">PawCare</p>
                <p className="navbar-subtitle text-xs -mt-0.5">Pet Care Assistant</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 p-1 rounded-full nav-container">
              {nav.map((item) => (
                <NavItem key={item.to + item.label} {...item} end={item.to === '/'} />
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/emergency"
                className="hidden sm:inline-flex items-center rounded-full nav-btn-emergency px-4 py-2 text-sm font-semibold transition-colors"
              >
                Emergency
              </Link>
              <Link
                to="/reminders"
                className="hidden sm:inline-flex rounded-full nav-btn-reminders px-4 py-2 text-sm font-semibold transition-colors"
              >
                Reminders
              </Link>
              
              {/* Profile Icon Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-primary-100 hover:bg-primary-200 text-primary-700'
                }`}
                aria-label="Open profile menu"
              >
                <User className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <nav className="md:hidden flex overflow-x-auto gap-1 pb-3 -mx-1 px-1 scrollbar-hide">
            {nav.map((item) => (
              <NavItem key={item.to + item.label} {...item} end={item.to === '/'} />
            ))}
            <Link
              to="/emergency"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap nav-btn-emergency"
            >
              Emergency
            </Link>
          </nav>
        </div>
      </header>

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
