import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  CalendarPlus,
  Siren,
  Syringe,
  Pill,
  ChevronRight,
  Sparkles,
  Dog,
  Cat,
} from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../AuthContext.jsx'

function PetTypeIcon({ type }) {
  const t = (type || '').toLowerCase()
  if (t === 'cat') return <Cat className="w-6 h-6 text-sky-600" strokeWidth={1.75} />
  return <Dog className="w-6 h-6 text-sky-600" strokeWidth={1.75} />
}

export function Dashboard() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [reminders, setReminders] = useState([])
  const firstName = user?.name?.split(/\s+/)[0] || 'there'

  useEffect(() => {
    Promise.all([api.getPets().catch(() => []), api.getReminders().catch(() => [])]).then(
      ([p, r]) => {
        setPets(p)
        setReminders(r)
      },
    )
  }, [])

  const upcoming = reminders.filter((r) => r.status === 'upcoming').slice(0, 4)
  const urgentIds = new Set(reminders.filter((r) => r.urgent).map((r) => r._id))

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-sky-500 to-emerald-500 p-8 sm:p-10 text-white shadow-soft">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Today&apos;s snapshot
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Hello, {firstName}{' '}
              <span className="inline-block" aria-hidden>
                👋
              </span>
            </h1>
            <p className="mt-3 text-sky-50/95 text-lg max-w-xl text-balance">
              Keep vaccines, meds, and vet visits on track — your pets deserve calm, organized care.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/pets/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-900/10 hover:bg-sky-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add pet
            </Link>
            <Link
              to="/appointments/book"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md px-5 py-3.5 text-sm font-semibold text-white ring-2 ring-white/30 hover:bg-white/20 transition-colors"
            >
              <CalendarPlus className="w-5 h-5" />
              Book appointment
            </Link>
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 hover:bg-red-600 transition-colors"
            >
              <Siren className="w-5 h-5" />
              Emergency
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="font-display text-xl font-bold text-slate-900">Pet summary</h2>
          <Link
            to="/pets"
            className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {pets.length === 0 ? (
          <p className="text-slate-500 text-sm">Add a pet to see summaries here.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.slice(0, 3).map((pet) => (
              <Link
                key={pet._id}
                to={`/pets/${pet._id}`}
                className="rounded-3xl bg-white border border-slate-100/90 p-6 shadow-card hover:shadow-soft hover:border-sky-100 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-50 to-mint-50 flex items-center justify-center ring-1 ring-sky-100/80">
                      <PetTypeIcon type={pet.type} />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-lg text-slate-900">{pet.name}</p>
                      <p className="text-sm text-slate-500 capitalize">{pet.type}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0 mt-1" />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
                    <dt className="text-slate-500">Age</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{pet.age} years</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
                    <dt className="text-slate-500">Weight</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{pet.weight} kg</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-slate-900">Upcoming reminders</h2>
            <Link to="/reminders" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
              Open panel
            </Link>
          </div>
          <ul className="space-y-3">
            {upcoming.length === 0 && (
              <li className="text-slate-500 text-sm py-4">No upcoming items. You&apos;re all set!</li>
            )}
            {upcoming.map((r) => (
              <li
                key={r._id}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 ${
                  urgentIds.has(r._id)
                    ? 'border-red-200 bg-red-50/80'
                    : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    r.kind === 'vaccination'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-mint-100 text-emerald-700'
                  }`}
                >
                  {r.kind === 'vaccination' ? (
                    <Syringe className="w-5 h-5" />
                  ) : (
                    <Pill className="w-5 h-5" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  <p className="text-sm text-slate-500">{r.petName}</p>
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap px-2.5 py-1 rounded-full ${
                    urgentIds.has(r._id) ? 'bg-red-100 text-red-700' : 'bg-white text-slate-600 ring-1 ring-slate-200'
                  }`}
                >
                  {r.dueLabel}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-mint-50 to-white border border-mint-100/80 p-6 sm:p-8 shadow-card">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Quick actions</h2>
          <p className="text-sm text-slate-600 mb-6">Shortcuts to the tasks you do most often.</p>
          <div className="grid gap-3">
            <Link
              to="/pets/new"
              className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:border-sky-200 hover:shadow-md transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Plus className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">Add pet</p>
                <p className="text-sm text-slate-500">Create a health profile</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
            </Link>
            <Link
              to="/appointments/book"
              className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:border-sky-200 hover:shadow-md transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-100 text-emerald-700">
                <CalendarPlus className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">Book appointment</p>
                <p className="text-sm text-slate-500">Pick a slot with your vet</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
            </Link>
            <Link
              to="/emergency"
              className="flex items-center gap-4 rounded-2xl bg-red-50 border border-red-100 p-4 shadow-sm hover:border-red-200 transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Siren className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold text-red-800">Emergency</p>
                <p className="text-sm text-red-600/80">24h clinics & first aid</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-300 ml-auto" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
