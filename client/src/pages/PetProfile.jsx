import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import QRCode from 'react-qr-code'
import {
  ArrowLeft,
  Syringe,
  Pill,
  Activity,
  Calendar,
  Weight,
  Cake,
  Dna,
  QrCode,
  Copy,
  Check,
} from 'lucide-react'
import { api } from '../api'

export function PetProfile() {
  const { id } = useParams()
  const location = useLocation()
  const [pet, setPet] = useState(null)
  const [err, setErr] = useState(null)
  const [copied, setCopied] = useState(false)

  /** Avoid skeleton flash when coming from Add Pet (state.pet matches URL id). */
  useLayoutEffect(() => {
    const passed = location.state?.pet
    if (passed && String(passed._id) === String(id)) {
      setPet(passed)
    } else {
      setPet(null)
    }
  }, [id, location.state])

  useEffect(() => {
    let cancelled = false
    setErr(null)
    api
      .getPet(id)
      .then((data) => {
        if (!cancelled) setPet(data)
      })
      .catch(() => {
        if (!cancelled) setErr('Could not load pet.')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    setCopied(false)
  }, [id])

  const scanUrl = useMemo(() => {
    const token = pet?.shareToken
    if (!token) return ''
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/pet/scan/${token}`
  }, [pet?.shareToken])

  async function copyScanLink() {
    if (!scanUrl) return
    try {
      await navigator.clipboard.writeText(scanUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (err)
    return (
      <p className="text-red-600">
        {err}{' '}
        <Link to="/pets" className="underline">
          Back to pets
        </Link>
      </p>
    )
  if (!pet)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    )

  const history = pet.medicalHistory || []
  const schedules = pet.schedules || []

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        to="/pets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to pets
      </Link>

      <div className="rounded-[2rem] bg-white border border-slate-100/90 shadow-card overflow-hidden">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-sky-400 via-sky-300 to-mint-300" />
        <div className="px-6 sm:px-10 pb-10 -mt-16 sm:-mt-20 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl bg-white p-1.5 shadow-xl ring-4 ring-white shrink-0">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-sky-100 to-mint-100 flex items-center justify-center text-5xl">
                {pet.photoEmoji || '🐾'}
              </div>
            </div>
            <div className="flex-1 pb-1">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">{pet.name}</h1>
              <p className="text-slate-600 mt-1 capitalize">
                {pet.breed || pet.type} · {pet.age} years old
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Weight className="w-4 h-4 text-sky-600" />
                  {pet.weight} kg
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  <Cake className="w-4 h-4 text-mint-500" />
                  Age {pet.age}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 capitalize">
                  <Dna className="w-4 h-4 text-violet-500" />
                  {pet.type}
                </span>
              </div>
            </div>
            <Link
              to="/appointments/book"
              className="sm:mb-2 inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 transition-colors"
            >
              Book visit
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex items-start gap-4 flex-1">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <QrCode className="w-6 h-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">ID tag & QR</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Unique code for this pet. Anyone who scans it sees your contact details and basic pet
                info — not medical records.
              </p>
              {scanUrl ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copyScanLink}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <span className="text-xs text-slate-400 break-all max-w-full">{scanUrl}</span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2 inline-block">
                  No QR token yet — restart the API once so tags can sync, then refresh this page.
                </p>
              )}
            </div>
          </div>
          {scanUrl && (
            <div className="shrink-0 flex justify-center lg:justify-end">
              <div className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-slate-100">
                <QRCode
                  value={scanUrl}
                  size={160}
                  level="M"
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                  style={{ borderRadius: '0.5rem' }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-sky-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">Medical history</h2>
          </div>
          <ol className="relative border-l-2 border-sky-100 ml-3 space-y-8 pl-8">
            {history.length === 0 && (
              <li className="text-slate-500 text-sm">No history logged yet.</li>
            )}
            {history.map((item, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[2.125rem] top-1 flex h-4 w-4 rounded-full bg-sky-400 ring-4 ring-sky-50" />
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{item.date}</p>
                <p className="font-semibold text-slate-900 mt-1">{item.title}</p>
                <p className="text-sm text-slate-600 mt-0.5">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="font-display text-lg font-bold text-slate-900">Upcoming schedules</h2>
          </div>
          <ul className="space-y-3">
            {schedules.length === 0 && (
              <li className="text-slate-500 text-sm">Nothing scheduled.</li>
            )}
            {schedules.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    s.type === 'vaccine' ? 'bg-sky-100 text-sky-700' : 'bg-mint-100 text-emerald-700'
                  }`}
                >
                  {s.type === 'vaccine' ? <Syringe className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{s.label}</p>
                  <p className="text-sm text-slate-500">{s.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
