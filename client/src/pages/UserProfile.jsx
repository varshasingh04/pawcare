import { User, Mail, Bell, Shield, ChevronRight } from 'lucide-react'
import { useAuth } from '../AuthContext.jsx'

export function UserProfile() {
  const { user } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="mt-2 text-slate-600">Account and notification preferences.</p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100/90 shadow-card overflow-hidden divide-y divide-slate-100">
        <div className="p-6 sm:p-8 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-2xl font-display font-bold">
            {initial}
          </div>
          <div>
            <p className="font-display font-bold text-xl text-slate-900">{user?.name || 'Member'}</p>
            <p className="text-sm text-slate-500">Pet parent · PawCare member</p>
          </div>
        </div>

        <button
          type="button"
          className="w-full flex items-center gap-4 p-5 sm:px-8 text-left hover:bg-slate-50/80 transition-colors"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <User className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Personal details</p>
            <p className="text-sm text-slate-500">Name, photo, timezone</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-4 p-5 sm:px-8 text-left hover:bg-slate-50/80 transition-colors"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-50 text-emerald-600">
            <Mail className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Email</p>
            <p className="text-sm text-slate-500">{user?.email || '—'}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-4 p-5 sm:px-8 text-left hover:bg-slate-50/80 transition-colors"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bell className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Notifications</p>
            <p className="text-sm text-slate-500">Reminders for vaccines & meds</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>

        <button
          type="button"
          className="w-full flex items-center gap-4 p-5 sm:px-8 text-left hover:bg-slate-50/80 transition-colors"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Shield className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Privacy & data</p>
            <p className="text-sm text-slate-500">Export or delete your data</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      </div>
    </div>
  )
}
