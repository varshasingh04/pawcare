import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Syringe, Pill, AlertTriangle, Bell } from 'lucide-react'
import { api } from '../api'

export function Reminders() {
  const [reminders, setReminders] = useState([])

  useEffect(() => {
    api.getReminders().then(setReminders).catch(() => setReminders([]))
  }, [])

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Reminders</h1>
          <p className="mt-2 text-slate-600">Vaccines, deworming, and meds — never miss what matters.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-sky-200 transition-colors"
        >
          <Bell className="w-4 h-4 text-sky-500" />
          Dashboard
        </Link>
      </div>

      <ul className="space-y-4">
        {reminders.length === 0 && (
          <li className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-500">
            No reminders yet. Add pets and schedules to see them here.
          </li>
        )}
        {reminders.map((r) => {
          const urgent = r.urgent
          return (
            <li
              key={r._id}
              className={`rounded-3xl border p-6 shadow-card transition-shadow ${
                urgent
                  ? 'bg-red-50/90 border-red-200 ring-1 ring-red-100'
                  : 'bg-white border-slate-100/90'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    urgent
                      ? 'bg-red-100 text-red-600'
                      : r.kind === 'vaccination'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-mint-100 text-emerald-700'
                  }`}
                >
                  {r.kind === 'vaccination' ? (
                    <Syringe className="w-6 h-6" />
                  ) : (
                    <Pill className="w-6 h-6" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`font-display font-bold text-lg ${urgent ? 'text-red-900' : 'text-slate-900'}`}>
                      {r.title}
                    </h2>
                    {urgent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white text-xs font-bold px-2.5 py-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${urgent ? 'text-red-800/90' : 'text-slate-500'}`}>
                    {r.petName}
                  </p>
                  <p
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      urgent ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r.dueLabel}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
