import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Mail,
  Phone,
  PawPrint,
  User,
  Heart,
  AlertTriangle,
  MapPin,
  Clock,
  MessageCircle,
  Gift,
  Navigation,
  CheckCircle,
} from 'lucide-react'
import { api } from '../api'

export function PetScan() {
  const { shareToken } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [showSightingForm, setShowSightingForm] = useState(false)
  const [sightingSubmitted, setSightingSubmitted] = useState(false)
  const [sightingForm, setSightingForm] = useState({
    notes: '',
    reportedBy: '',
    contactInfo: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    if (!shareToken) {
      setError('Invalid link')
      return
    }
    api
      .getPublicPetByShareToken(shareToken)
      .then(setData)
      .catch(() => setError('This pet tag was not found or is no longer valid.'))
  }, [shareToken])

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setGettingLocation(false)
        setShowSightingForm(true)
      },
      () => {
        alert('Unable to get your location. Please enable location access.')
        setGettingLocation(false)
      },
    )
  }

  async function handleSubmitSighting(e) {
    e.preventDefault()
    if (!userLocation) {
      alert('Please share your location first')
      return
    }

    setSubmitting(true)
    try {
      await api.reportSighting(data.pet.id, {
        location: userLocation,
        notes: sightingForm.notes,
        reportedBy: sightingForm.reportedBy || 'Anonymous',
        contactInfo: sightingForm.contactInfo,
      })
      setSightingSubmitted(true)
      setShowSightingForm(false)
    } catch (err) {
      alert(err.message || 'Failed to report sighting')
    }
    setSubmitting(false)
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-sky-50 via-white to-mint-50/80">
        <div className="max-w-md text-center rounded-3xl bg-white border border-slate-100 shadow-card p-10">
          <PawPrint className="w-12 h-12 text-sky-400 mx-auto mb-4" strokeWidth={1.75} />
          <h1 className="font-display text-xl font-bold text-slate-900">Tag not found</h1>
          <p className="mt-2 text-slate-600 text-sm">{error}</p>
          <Link
            to="/login"
            className="mt-8 inline-block text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            PawCare home
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-mint-50/80">
        <div className="h-12 w-12 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
      </div>
    )
  }

  const { pet, owner, isLost, lostInfo } = data

  if (isLost && lostInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50/80 px-4 py-6 sm:py-10">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-red-600 font-display font-bold text-lg">
              <AlertTriangle className="w-7 h-7" strokeWidth={2} />
              LOST PET
            </div>
          </div>

          <div className="rounded-[2rem] bg-white border-2 border-red-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 px-8 py-8 text-center relative">
              <div className="absolute top-4 left-4 right-4 flex justify-center">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                  Help Find Me!
                </span>
              </div>
              <div className="text-6xl mb-3 mt-4" aria-hidden>
                {pet.photoEmoji || '🐾'}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-sm">
                {pet.name}
              </h1>
              <p className="text-red-100 text-sm mt-2 capitalize">
                {[pet.breed || pet.type, pet.age != null ? `${pet.age} yrs` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {lostInfo.reward && (
                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <Gift className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Reward</p>
                    <p className="text-amber-900 font-semibold">{lostInfo.reward}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Last Seen
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{lostInfo.lastSeenLocation?.address || 'Unknown'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    When
                  </div>
                  <p className="text-slate-900 text-sm font-medium">{formatDate(lostInfo.lastSeenDate)}</p>
                </div>
              </div>

              {(lostInfo.description || lostInfo.wearing || lostInfo.behaviorNotes) && (
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                  {lostInfo.wearing && (
                    <p className="text-sm">
                      <span className="font-semibold text-slate-700">Wearing:</span>{' '}
                      <span className="text-slate-600">{lostInfo.wearing}</span>
                    </p>
                  )}
                  {lostInfo.description && (
                    <p className="text-sm">
                      <span className="font-semibold text-slate-700">Description:</span>{' '}
                      <span className="text-slate-600">{lostInfo.description}</span>
                    </p>
                  )}
                  {lostInfo.behaviorNotes && (
                    <p className="text-sm">
                      <span className="font-semibold text-slate-700">Behavior:</span>{' '}
                      <span className="text-slate-600">{lostInfo.behaviorNotes}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Owner Immediately
                </h2>

                <div className="space-y-2">
                  {lostInfo.contactPhone && (
                    <a
                      href={`tel:${lostInfo.contactPhone.replace(/\s/g, '')}`}
                      className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-4 py-4 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call: {lostInfo.contactPhone}</span>
                    </a>
                  )}

                  {lostInfo.contactWhatsApp && (
                    <a
                      href={`https://wa.me/${lostInfo.contactWhatsApp.replace(/\D/g, '')}?text=Hi! I found your pet ${pet.name}!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-green-500 px-4 py-4 text-white font-semibold shadow-lg shadow-green-500/25 hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {lostInfo.contactEmail && (
                    <a
                      href={`mailto:${lostInfo.contactEmail}?subject=Found your pet ${pet.name}!`}
                      className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 text-slate-700 font-semibold hover:border-sky-300 hover:bg-sky-50 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Email: {lostInfo.contactEmail}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {sightingSubmitted ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-4">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800">Thank you!</p>
                      <p className="text-sm text-emerald-700">Your sighting has been reported to the owner.</p>
                    </div>
                  </div>
                ) : showSightingForm ? (
                  <form onSubmit={handleSubmitSighting} className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 text-sm">
                      <Navigation className="w-4 h-4" />
                      Location captured
                    </div>
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={sightingForm.reportedBy}
                      onChange={(e) => setSightingForm((f) => ({ ...f, reportedBy: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <input
                      type="text"
                      placeholder="Your phone/email (optional)"
                      value={sightingForm.contactInfo}
                      onChange={(e) => setSightingForm((f) => ({ ...f, contactInfo: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <textarea
                      placeholder="Any details? (e.g., heading towards park, looks healthy)"
                      value={sightingForm.notes}
                      onChange={(e) => setSightingForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSightingForm(false)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-60"
                      >
                        {submitting ? 'Sending…' : 'Report Sighting'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-4 text-slate-600 font-semibold hover:border-sky-300 hover:bg-sky-50/50 transition-colors disabled:opacity-60"
                  >
                    <MapPin className="w-5 h-5" />
                    {gettingLocation ? 'Getting location…' : "I spotted this pet — share my location"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Shared via PawCare · Help reunite lost pets with their families
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-mint-50/80 px-4 py-10 sm:py-16">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sky-600 font-display font-bold text-lg">
            <PawPrint className="w-7 h-7" strokeWidth={2} />
            PawCare
          </div>
          <p className="text-sm text-slate-500 mt-1">Pet contact card</p>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-100/90 shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 via-sky-300 to-mint-300 px-8 py-10 text-center">
            <div className="text-6xl mb-3" aria-hidden>
              {pet.photoEmoji || '🐾'}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
              {pet.name}
            </h1>
            <p className="text-sky-50 text-sm mt-2 capitalize">
              {[pet.breed || pet.type, pet.age != null ? `${pet.age} yrs` : null].filter(Boolean).join(' · ')}
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
              <Heart className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed">
                If you found this pet, please contact the owner using the details below.
              </p>
            </div>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner
              </h2>
              <p className="font-display text-xl font-bold text-gray-900">{owner.name}</p>
            </div>

            <ul className="space-y-3">
              {owner.phone && (
                <li>
                  <a
                    href={`tel:${owner.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-sky-300 hover:bg-sky-50 transition-colors"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Phone className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{owner.phone}</p>
                    </div>
                  </a>
                </li>
              )}
              {owner.email && (
                <li>
                  <a
                    href={`mailto:${owner.email}`}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 hover:border-sky-300 hover:bg-sky-50 transition-colors"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <Mail className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 truncate">{owner.email}</p>
                    </div>
                  </a>
                </li>
              )}
              {!owner.phone && !owner.email && (
                <li className="text-sm text-gray-600 text-center py-4">No contact details on file.</li>
              )}
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Shared via PawCare · medical records are never shown on this page.
        </p>
      </div>
    </div>
  )
}
