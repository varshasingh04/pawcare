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
  Bird,
  Stethoscope,
  Utensils,
  Heart,
  PawPrint,
  Trash2,
} from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../AuthContext.jsx'
import { EmptyState } from '../components/EmptyState'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', emoji: '🌅' }
  if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' }
  if (hour < 21) return { text: 'Good evening', emoji: '🌆' }
  return { text: 'Good night', emoji: '🌙' }
}

function PetTypeIcon({ type, className = "w-6 h-6" }) {
  const t = (type || '').toLowerCase()
  if (t === 'cat') return <Cat className={`${className} text-amber-500`} strokeWidth={1.75} />
  if (t === 'bird') return <Bird className={`${className} text-sky-500`} strokeWidth={1.75} />
  return <Dog className={`${className} text-sky-600`} strokeWidth={1.75} />
}

function PetAvatar({ pet }) {
  const colors = {
    dog: 'from-sky-400 to-blue-500',
    cat: 'from-amber-400 to-orange-500',
    bird: 'from-emerald-400 to-teal-500',
  }
  const bg = colors[(pet.type || 'dog').toLowerCase()] || colors.dog
  
  return (
    <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <PetTypeIcon type={pet.type} className="w-8 h-8 text-white" />
      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
        <Heart className="w-3 h-3 text-white fill-white" />
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const firstName = user?.name?.split(/\s+/)[0] || 'there'
  const greeting = getGreeting()

  useEffect(() => {
    Promise.all([api.getPets().catch(() => []), api.getReminders().catch(() => [])]).then(
      ([p, r]) => {
        setPets(p)
        setReminders(r)
        setLoading(false)
      },
    )
  }, [])

  const upcoming = reminders.filter((r) => r.status === 'upcoming').slice(0, 4)
  const urgentIds = new Set(reminders.filter((r) => r.urgent).map((r) => r._id))

  const handleDeleteReminder = async (id) => {
    if (!confirm('Delete this reminder?')) return
    try {
      await api.deleteReminder(id)
      setReminders((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete reminder')
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-100 via-primary-50 to-teal-50 dark:from-charcoal-800 dark:via-charcoal-900 dark:to-primary-900/30 p-8 sm:p-10 shadow-lg shadow-primary-500/10 border border-primary-200 dark:border-charcoal-700 hero-card">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-300/40 dark:bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-teal-200/60 dark:bg-primary-500/10 blur-2xl" />
        <div className="absolute top-6 right-6 opacity-10">
          <PawPrint className="w-32 h-32 rotate-12 text-primary-500" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/50 px-3 py-1 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span className="text-primary-700 dark:text-primary-300">Today&apos;s snapshot</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-800 dark:text-white">
              {greeting.text}, {firstName}{' '}
              <span className="inline-block" aria-hidden>
                {greeting.emoji}
              </span>
            </h1>
            <p className="mt-3 text-charcoal-600 dark:text-charcoal-300 text-lg max-w-xl text-balance">
              {pets.length > 0 
                ? `You have ${pets.length} furry friend${pets.length > 1 ? 's' : ''} counting on you today!`
                : 'Keep vaccines, meds, and vet visits on track — your pets deserve calm, organized care.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/pets/new"
              className="btn-gradient-primary inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add pet
            </Link>
            <Link
              to="/appointments/book"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-charcoal-800 dark:bg-charcoal-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-charcoal-700 dark:hover:bg-charcoal-600 transition-colors"
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
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-sky-500" />
            Your Pets
          </h2>
          {pets.length > 0 && (
            <Link
              to="/pets"
              className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
            >
              View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        {loading ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-8">
            <EmptyState type="loading" />
          </div>
        ) : pets.length === 0 ? (
          <div className="glass-card p-8">
            <EmptyState 
              type="pets"
              action={
                <Link
                  to="/pets/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all hover:scale-105 shadow-lg shadow-sky-500/25"
                >
                  <Plus className="w-5 h-5" />
                  Add your first pet
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.slice(0, 3).map((pet, index) => (
              <Link
                key={pet._id}
                to={`/pets/${pet._id}`}
                className="glass-card p-6 hover:shadow-xl dark:hover:shadow-dark-soft hover:border-sky-200 dark:hover:border-sky-700 hover:-translate-y-1 transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <PetAvatar pet={pet} />
                    <div>
                      <p className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{pet.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize flex items-center gap-1">
                        {pet.type}
                        {pet.breed && <span className="text-slate-500 dark:text-slate-500">• {pet.breed}</span>}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="stat-pill stat-pill-blue rounded-2xl px-4 py-3 transition-colors">
                    <dt className="text-xs uppercase tracking-wide">Age</dt>
                    <dd className="font-bold mt-0.5">{pet.age} years</dd>
                  </div>
                  <div className="stat-pill stat-pill-green rounded-2xl px-4 py-3 transition-colors">
                    <dt className="text-xs uppercase tracking-wide">Weight</dt>
                    <dd className="font-bold mt-0.5">{pet.weight} kg</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="glass-card p-6 sm:p-8 hover:shadow-lg dark:hover:shadow-dark-soft transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-emerald-500" />
              Upcoming reminders
            </h2>
            <Link to="/reminders" className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group">
              Open panel <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-4">
              <EmptyState 
                type="reminders" 
                title="All caught up!"
                subtitle="No upcoming reminders. Your pets are well taken care of!"
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((r, index) => (
                <li
                  key={r._id}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all animate-slide-up ${
                    urgentIds.has(r._id)
                      ? 'border-red-200 bg-red-50/80 dark:bg-red-900/20 dark:border-red-800/50'
                      : 'border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800/50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${
                      r.kind === 'vaccination'
                        ? 'bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700'
                        : 'bg-gradient-to-br from-mint-100 to-emerald-200 text-emerald-700'
                    }`}
                  >
                    {r.kind === 'vaccination' ? (
                      <Syringe className="w-5 h-5" />
                    ) : (
                      <Pill className="w-5 h-5" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <PawPrint className="w-3 h-3" /> {r.petName}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap px-3 py-1.5 rounded-full ${
                      urgentIds.has(r._id) 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-white dark:bg-dark-700 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-dark-600'
                    }`}
                  >
                    {r.dueLabel}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteReminder(r._id)
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-cream-50 to-white dark:from-charcoal-800 dark:to-charcoal-900 border border-cream-200 dark:border-charcoal-700 p-6 sm:p-8 shadow-card dark:shadow-dark-card">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Quick actions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Shortcuts to the tasks you do most often.</p>
          <div className="grid gap-3">
            <Link
              to="/pets/new"
              className="action-card flex items-center gap-4 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
                <Plus className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold">Add pet</p>
                <p className="text-sm text-gray-600">Create a health profile</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-auto" />
            </Link>
            <Link
              to="/appointments/book"
              className="action-card flex items-center gap-4 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <CalendarPlus className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold">Book appointment</p>
                <p className="text-sm text-gray-600">Pick a slot with your vet</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-auto" />
            </Link>
            <Link
              to="/emergency"
              className="flex items-center gap-4 rounded-2xl p-4 shadow-sm transition-all"
              style={{ background: 'var(--emergency-bg, #fef2f2)', borderColor: 'var(--emergency-border, #fecaca)', border: '1px solid' }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <Siren className="w-6 h-6" />
              </span>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Emergency</p>
                <p className="text-sm text-red-600 dark:text-red-400">24h clinics & first aid</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400 dark:text-red-500 ml-auto" />
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-primary-50 via-cream-50 to-white dark:from-primary-900/20 dark:via-charcoal-800 dark:to-charcoal-900 border border-primary-100 dark:border-primary-800/30 p-6 sm:p-8 shadow-card dark:shadow-dark-card">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">AI-Powered Tools</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Get instant AI-powered guidance for your pet's health and nutrition.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/symptom-checker"
            className="action-card flex items-center gap-4 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
              <Stethoscope className="w-7 h-7" />
            </span>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Symptom Checker</p>
              <p className="text-sm text-gray-600">Check symptoms & get guidance</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-violet-500 transition-colors" />
          </Link>
          <Link
            to="/nutrition-advisor"
            className="action-card flex items-center gap-4 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Utensils className="w-7 h-7" />
            </span>
            <div className="flex-1">
              <p className="font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Nutrition Advisor</p>
              <p className="text-sm text-gray-600">Get personalized diet plans</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors" />
          </Link>
        </div>
      </section>
    </div>
  )
}
