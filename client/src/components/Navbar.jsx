import { NavLink, Link } from 'react-router-dom'
import { PawPrint, LayoutDashboard, Heart, Stethoscope, User, LogOut, MapPin, Sun, Moon } from 'lucide-react'
import { useTheme } from '../ThemeContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pets', label: 'Pets', icon: Heart },
  { to: '/vets', label: 'Vets', icon: Stethoscope },
  { to: '/help-map', label: 'Help Map', icon: MapPin },
  { to: '/profile', label: 'Profile', icon: User },
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

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-navbar transition-all duration-300">
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
              className="rounded-full nav-btn-reminders px-4 py-2 text-sm font-semibold transition-colors"
            >
              Reminders
            </Link>
            <Link
              to="/logout"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full nav-btn-logout px-4 py-2 text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Link>
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
          <Link
            to="/logout"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap nav-btn-logout"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Link>
        </nav>
      </div>
    </header>
  )
}
