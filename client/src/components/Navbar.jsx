import { NavLink, Link } from 'react-router-dom'
import { PawPrint, LayoutDashboard, Heart, Stethoscope, User, LogOut, MapPin } from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pets', label: 'Pets', icon: Heart },
  { to: '/vets', label: 'Vets', icon: Stethoscope },
  { to: '/help-map', label: 'Help Map', icon: MapPin },
  { to: '/profile', label: 'Profile', icon: User },
]

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end ?? to === '/'}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
            : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700',
        ].join(' ')
      }
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      {label}
    </NavLink>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-sky-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-500/30 transition-transform group-hover:scale-105">
              <PawPrint className="w-5 h-5" strokeWidth={2.2} />
            </span>
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold tracking-tight text-slate-900">PawCare</p>
              <p className="text-xs text-slate-500 -mt-0.5">Pet Care Assistant</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-50/90 border border-slate-100/80">
            {nav.map((item) => (
              <NavItem key={item.to + item.label} {...item} end={item.to === '/'} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/emergency"
              className="hidden sm:inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-100 hover:bg-red-100 transition-colors"
            >
              Emergency
            </Link>
            <Link
              to="/reminders"
              className="rounded-full bg-mint-100 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-mint-200/80 hover:bg-mint-200/80 transition-colors"
            >
              Reminders
            </Link>
            <Link
              to="/logout"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
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
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap bg-red-50 text-red-600"
          >
            Emergency
          </Link>
          <Link
            to="/logout"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap border border-slate-200 text-slate-600"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Link>
        </nav>
      </div>
    </header>
  )
}
