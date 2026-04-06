import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
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
  Heart,
  Plus,
  AlertCircle,
  Shield,
  FileCheck,
  Eye,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Download,
  CheckCircle,
} from 'lucide-react'
import { api } from '../api'

const HEAT_CYCLE_TIPS = {
  dog: [
    'Keep her on a leash during walks',
    'Use dog diapers if needed for hygiene',
    'Avoid off-leash areas with male dogs',
    'She may be restless or extra clingy — this is normal',
    'Consider spaying after the cycle ends if not breeding',
  ],
  cat: [
    'Keep her strictly indoors (escape risk is very high)',
    'She may vocalize loudly — this is normal',
    'Provide extra attention and comfort',
    'She may be more affectionate or restless',
    'Consider spaying after the cycle ends if not breeding',
  ],
}

const CYCLE_INTERVALS = {
  dog: 180,
  cat: 21,
}

function getNextHeatEstimate(lastDate, petType) {
  if (!lastDate) return null
  const t = (petType || '').toLowerCase()
  const intervalDays = CYCLE_INTERVALS[t] || 180
  const next = new Date(lastDate)
  next.setDate(next.getDate() + intervalDays)
  return next
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getDaysUntil(targetDate) {
  if (!targetDate) return null
  const now = new Date()
  const target = new Date(targetDate)
  const diffMs = target - now
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getHeatStatus(nextDate) {
  const days = getDaysUntil(nextDate)
  if (days === null) return { label: 'No data', color: 'slate' }
  if (days < 0) return { label: 'Possibly in heat or overdue', color: 'red' }
  if (days <= 14) return { label: `Due in ~${days} days`, color: 'amber' }
  return { label: `Expected in ~${days} days`, color: 'emerald' }
}

const TYPES = ['Dog', 'Cat', 'Bird']

export function PetProfile() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [err, setErr] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showHeatModal, setShowHeatModal] = useState(false)
  const [heatDate, setHeatDate] = useState('')
  const [heatNotes, setHeatNotes] = useState('')
  const [savingHeat, setSavingHeat] = useState(false)
  const [vaccinations, setVaccinations] = useState([])
  const [loadingVax, setLoadingVax] = useState(true)
  const [viewingProof, setViewingProof] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lostReport, setLostReport] = useState(null)
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostForm, setLostForm] = useState({
    address: '',
    lastSeenDate: new Date().toISOString().slice(0, 16),
    wearing: '',
    description: '',
    behaviorNotes: '',
    reward: '',
    contactPhone: '',
    contactWhatsApp: '',
  })
  const [savingLost, setSavingLost] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [lostLocation, setLostLocation] = useState(null)

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

  useEffect(() => {
    if (!id) return
    setLoadingVax(true)
    api
      .getVaccinations(id)
      .then(setVaccinations)
      .catch(() => setVaccinations([]))
      .finally(() => setLoadingVax(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    api
      .getLostReport(id)
      .then(setLostReport)
      .catch(() => setLostReport(null))
  }, [id])

  function getLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLostLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGettingLocation(false)
      },
      () => {
        alert('Unable to get location. Please enter address manually.')
        setGettingLocation(false)
      },
    )
  }

  async function handleMarkLost(e) {
    e.preventDefault()
    if (!lostForm.address) {
      alert('Please enter the last seen location')
      return
    }
    setSavingLost(true)
    try {
      const report = await api.markPetLost(id, {
        lastSeenLocation: {
          lat: lostLocation?.lat || 0,
          lng: lostLocation?.lng || 0,
          address: lostForm.address,
        },
        lastSeenDate: lostForm.lastSeenDate,
        wearing: lostForm.wearing,
        description: lostForm.description,
        behaviorNotes: lostForm.behaviorNotes,
        reward: lostForm.reward,
        contactPhone: lostForm.contactPhone,
        contactWhatsApp: lostForm.contactWhatsApp,
      })
      setLostReport(report)
      setShowLostModal(false)
    } catch (err) {
      alert(err.message || 'Failed to mark pet as lost')
    }
    setSavingLost(false)
  }

  async function handleMarkFound() {
    if (!confirm('Has your pet been found? This will remove the lost status.')) return
    try {
      await api.markPetFound(id, 'Pet has been reunited with owner!')
      setLostReport(null)
    } catch (err) {
      alert(err.message || 'Failed to mark pet as found')
    }
  }

  async function viewProof(recordId) {
    try {
      const record = await api.getVaccination(id, recordId)
      if (record?.proofImage) {
        setViewingProof(record)
      }
    } catch {
      alert('Could not load proof image')
    }
  }

  function openEditModal() {
    setEditForm({
      name: pet.name || '',
      type: pet.type || 'Dog',
      age: pet.age || '',
      weight: pet.weight || '',
      breed: pet.breed || '',
      gender: pet.gender || 'unknown',
      reproductiveStatus: pet.reproductiveStatus || 'unknown',
    })
    setShowEditModal(true)
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.updatePet(id, editForm)
      setPet(updated)
      setShowEditModal(false)
    } catch (err) {
      alert(err.message || 'Failed to update pet')
    }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.deletePet(id)
      navigate('/pets', { replace: true })
    } catch (err) {
      alert(err.message || 'Failed to delete pet')
      setDeleting(false)
    }
  }

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

  const showHeatTracker =
    pet.gender === 'female' &&
    pet.reproductiveStatus === 'intact' &&
    ['dog', 'cat'].includes((pet.type || '').toLowerCase())

  const heatCycles = pet.heatCycles || []
  const lastHeatCycle = heatCycles.length > 0 ? heatCycles[heatCycles.length - 1] : null
  const lastHeatDate = lastHeatCycle?.startDate
  const nextHeatEstimate = getNextHeatEstimate(lastHeatDate, pet.type)
  const heatStatus = getHeatStatus(nextHeatEstimate)
  const careTips = HEAT_CYCLE_TIPS[(pet.type || '').toLowerCase()] || []

  async function handleLogHeatCycle(e) {
    e.preventDefault()
    if (!heatDate) return
    setSavingHeat(true)
    try {
      const updated = await api.logHeatCycle(pet._id, { startDate: heatDate, notes: heatNotes })
      setPet(updated)
      setShowHeatModal(false)
      setHeatDate('')
      setHeatNotes('')
    } catch (error) {
      alert(error.message || 'Failed to log heat cycle')
    }
    setSavingHeat(false)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        to="/pets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to pets
      </Link>

      {lostReport && lostReport.status === 'lost' && (
        <section className="rounded-3xl bg-gradient-to-r from-red-500 via-red-400 to-orange-400 p-6 sm:p-8 shadow-xl text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">This pet is marked as LOST</h2>
                <p className="text-red-100 text-sm mt-1">
                  Last seen: {lostReport.lastSeenLocation?.address || 'Unknown'} on{' '}
                  {formatDate(lostReport.lastSeenDate)}
                </p>
                {lostReport.sightings?.length > 0 && (
                  <p className="text-white/90 text-sm mt-2 font-semibold">
                    {lostReport.sightings.length} sighting(s) reported!
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/pets/${id}/lost-poster`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                Poster
              </Link>
              <button
                type="button"
                onClick={handleMarkFound}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Found!
              </button>
            </div>
          </div>
          {lostReport.sightings?.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-white/90 hover:text-white">
                View sightings
              </summary>
              <ul className="mt-3 space-y-2">
                {lostReport.sightings.map((s, i) => (
                  <li key={i} className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 text-sm">
                    <span className="font-medium">{s.reportedBy || 'Anonymous'}</span>
                    {s.notes && <span className="text-white/80"> — {s.notes}</span>}
                    <p className="text-white/70 text-xs mt-1">
                      {formatDate(s.createdAt)}
                      {s.contactInfo && ` · Contact: ${s.contactInfo}`}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      <div className="rounded-[2rem] bg-white border border-slate-100/90 shadow-card overflow-hidden">
        <div className={`h-32 sm:h-40 ${lostReport?.status === 'lost' ? 'bg-gradient-to-r from-red-400 via-orange-300 to-amber-300' : 'bg-gradient-to-r from-sky-400 via-sky-300 to-mint-300'}`} />
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
            <div className="flex flex-wrap gap-2 sm:mb-2">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
              {!lostReport || lostReport.status !== 'lost' ? (
                <button
                  type="button"
                  onClick={() => setShowLostModal(true)}
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Mark Lost
                </button>
              ) : null}
              <Link
                to="/appointments/book"
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 transition-colors"
              >
                Book visit
              </Link>
            </div>
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

      {showHeatTracker && (
        <section className="rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100/80 p-6 sm:p-8 shadow-card">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <Heart className="w-6 h-6" strokeWidth={2} />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Heat Cycle Tracker</h2>
                <p className="text-sm text-slate-600">Track and predict reproductive cycles</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHeatModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log cycle
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-white/80 border border-pink-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-1">Last cycle</p>
              <p className="text-lg font-bold text-slate-900">{formatDate(lastHeatDate)}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-pink-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-1">Next expected</p>
              <p className="text-lg font-bold text-slate-900">{formatDate(nextHeatEstimate)}</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-pink-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-1">Status</p>
              <p className={`text-lg font-bold text-${heatStatus.color}-600`}>{heatStatus.label}</p>
            </div>
          </div>

          {careTips.length > 0 && (
            <div className="rounded-2xl bg-white/60 border border-pink-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-pink-600" />
                <p className="text-sm font-semibold text-pink-800">Care tips during heat</p>
              </div>
              <ul className="space-y-2">
                {careTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-pink-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {heatCycles.length > 1 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-pink-700 hover:text-pink-800">
                View cycle history ({heatCycles.length} records)
              </summary>
              <ul className="mt-3 space-y-2">
                {[...heatCycles].reverse().map((cycle, i) => (
                  <li
                    key={cycle._id || i}
                    className="flex items-center justify-between rounded-xl bg-white/80 border border-pink-100 px-4 py-2 text-sm"
                  >
                    <span className="text-slate-700">{formatDate(cycle.startDate)}</span>
                    {cycle.notes && <span className="text-slate-500 text-xs">{cycle.notes}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {showHeatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Log Heat Cycle</h3>
            <form onSubmit={handleLogHeatCycle} className="space-y-4">
              <div>
                <label htmlFor="heatDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Start date
                </label>
                <input
                  id="heatDate"
                  type="date"
                  required
                  value={heatDate}
                  onChange={(e) => setHeatDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label htmlFor="heatNotes" className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="heatNotes"
                  type="text"
                  value={heatNotes}
                  onChange={(e) => setHeatNotes(e.target.value)}
                  placeholder="e.g., Mild symptoms"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHeatModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingHeat}
                  className="flex-1 rounded-xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 hover:bg-pink-600 disabled:opacity-60"
                >
                  {savingHeat ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/80 p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Shield className="w-6 h-6" strokeWidth={2} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Vaccination Records</h2>
              <p className="text-sm text-slate-600">Verified records with proof from vet</p>
            </div>
          </div>
          <Link
            to={`/pets/${id}/vaccinations/new`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add record
          </Link>
        </div>

        {loadingVax ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
          </div>
        ) : vaccinations.length === 0 ? (
          <div className="rounded-2xl bg-white/60 border border-emerald-100 p-6 text-center">
            <FileCheck className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">No vaccination records yet.</p>
            <p className="text-slate-500 text-xs mt-1">Add your first record with proof from your vet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {vaccinations.map((vax) => {
              const isOverdue = new Date(vax.nextDueDate) < new Date()
              return (
                <li
                  key={vax._id}
                  className="flex items-center gap-4 rounded-2xl bg-white/80 border border-emerald-100 px-4 py-3"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isOverdue ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <Syringe className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{vax.vaccineLabel}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(vax.dateGiven)} · {vax.vetName}
                    </p>
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-600 font-semibold' : 'text-emerald-600'}`}>
                      {vax.dueLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => viewProof(vax._id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Proof
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-auto">
            <button
              type="button"
              onClick={() => setViewingProof(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">
              {viewingProof.vaccineLabel} — Proof
            </h3>
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
              {viewingProof.proofMimeType?.startsWith('image/') ? (
                <img
                  src={viewingProof.proofImage}
                  alt="Vaccination proof"
                  className="w-full max-h-[60vh] object-contain"
                />
              ) : (
                <div className="p-8 text-center">
                  <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">PDF document uploaded</p>
                  <a
                    href={viewingProof.proofImage}
                    download={`vaccination-proof-${viewingProof._id}.pdf`}
                    className="inline-flex items-center gap-2 mt-4 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Date Given</p>
                <p className="font-medium text-slate-900">{formatDate(viewingProof.dateGiven)}</p>
              </div>
              <div>
                <p className="text-slate-500">Next Due</p>
                <p className="font-medium text-slate-900">{formatDate(viewingProof.nextDueDate)}</p>
              </div>
              <div>
                <p className="text-slate-500">Vet / Clinic</p>
                <p className="font-medium text-slate-900">{viewingProof.vetName}</p>
              </div>
              {viewingProof.notes && (
                <div>
                  <p className="text-slate-500">Notes</p>
                  <p className="font-medium text-slate-900">{viewingProof.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-auto">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Edit Pet</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>
                <input
                  id="editName"
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label htmlFor="editType" className="block text-sm font-semibold text-slate-700 mb-2">
                  Type
                </label>
                <select
                  id="editType"
                  value={editForm.type}
                  onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editAge" className="block text-sm font-semibold text-slate-700 mb-2">
                    Age (years)
                  </label>
                  <input
                    id="editAge"
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={editForm.age}
                    onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
                <div>
                  <label htmlFor="editWeight" className="block text-sm font-semibold text-slate-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    id="editWeight"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={editForm.weight}
                    onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="editBreed" className="block text-sm font-semibold text-slate-700 mb-2">
                  Breed <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="editBreed"
                  type="text"
                  value={editForm.breed}
                  onChange={(e) => setEditForm((f) => ({ ...f, breed: e.target.value }))}
                  placeholder="e.g., Golden Retriever"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                <div className="flex gap-4">
                  {['male', 'female'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editGender"
                        value={g}
                        checked={editForm.gender === g}
                        onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                        className="w-4 h-4 text-sky-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Delete {pet.name}?</h3>
            <p className="text-slate-600 text-sm mb-6">
              This will permanently remove all data including vaccination records and health history.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">Report {pet.name} as Lost</h3>
                <p className="text-sm text-slate-500">Fill in details to help find your pet</p>
              </div>
            </div>

            <form onSubmit={handleMarkLost} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Seen Location *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Central Park, near the fountain"
                    value={lostForm.address}
                    onChange={(e) => setLostForm((f) => ({ ...f, address: e.target.value }))}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={gettingLocation}
                    className="rounded-xl border border-slate-200 px-3 py-3 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    title="Get current location"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                {lostLocation && (
                  <p className="text-xs text-emerald-600 mt-1">GPS location captured</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Seen Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={lostForm.lastSeenDate}
                  onChange={(e) => setLostForm((f) => ({ ...f, lastSeenDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What is {pet.name} wearing?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Red collar with bell, blue leash"
                  value={lostForm.wearing}
                  onChange={(e) => setLostForm((f) => ({ ...f, wearing: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description / Identifying Features
                </label>
                <textarea
                  placeholder="e.g., White spot on chest, limps slightly on left leg"
                  value={lostForm.description}
                  onChange={(e) => setLostForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Behavior Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g., Friendly with strangers, scared of loud noises"
                  value={lostForm.behaviorNotes}
                  onChange={(e) => setLostForm((f) => ({ ...f, behaviorNotes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={lostForm.contactPhone}
                    onChange={(e) => setLostForm((f) => ({ ...f, contactPhone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="WhatsApp number"
                    value={lostForm.contactWhatsApp}
                    onChange={(e) => setLostForm((f) => ({ ...f, contactWhatsApp: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reward (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., $100 reward for safe return"
                  value={lostForm.reward}
                  onChange={(e) => setLostForm((f) => ({ ...f, reward: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLostModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLost}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 disabled:opacity-60"
                >
                  {savingLost ? 'Saving…' : 'Mark as Lost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
