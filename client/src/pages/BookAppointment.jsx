import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, CheckCircle2, ArrowLeft } from 'lucide-react'
import { api } from '../api'

const SLOTS = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00']

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function fmt(d) {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function BookAppointment() {
  const location = useLocation()
  const vetHint = location.state?.vetName

  const days = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [])

  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  async function confirm() {
    setErr(null)
    setLoading(true)
    try {
      await api.createAppointment({
        date: days[selectedDay].toISOString(),
        time: selectedSlot,
        vetName: vetHint || 'Preferred clinic',
      })
      setDone(true)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mb-6">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">You&apos;re booked</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {fmt(days[selectedDay])} at {selectedSlot}
          {vetHint ? ` with ${vetHint}` : ''}.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        to="/vets"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-sky-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Vets
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight">Book appointment</h1>
        <p className="mt-2 text-gray-700">
          Choose a date and time. {vetHint && <span className="font-medium text-gray-800">Suggested: {vetHint}</span>}
        </p>
      </div>

      <div className="action-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-display font-bold">Select date</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {days.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSelectedDay(i)
                  setSelectedSlot(null)
                }}
                className={`date-btn shrink-0 rounded-2xl px-4 py-3 min-w-[5.5rem] text-left transition-all ${
                  selectedDay === i
                    ? 'selected'
                    : ''
                }`}
              >
                <p className="text-xs font-medium opacity-80">
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="text-lg font-display font-bold">{d.getDate()}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold mb-4">Time slots</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedSlot(t)}
                className={`time-btn rounded-2xl py-3 text-sm font-semibold transition-all ${
                  selectedSlot === t
                    ? 'selected'
                    : ''
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {err && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 border border-red-200 dark:border-red-800">
            {err}
          </div>
        )}

        <button
          type="button"
          disabled={!selectedSlot || loading}
          onClick={confirm}
          className="w-full rounded-2xl bg-sky-500 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Confirming…' : 'Confirm booking'}
        </button>
      </div>
    </div>
  )
}
