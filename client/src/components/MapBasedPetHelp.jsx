import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { Plus, X, MapPin, Locate } from 'lucide-react'
import { api } from '../api'

const FALLBACK_CENTER = { lat: 28.6139, lng: 77.209 } // New Delhi
const DEFAULT_ZOOM = 13

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function haversineDistanceKm(a, b) {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(s))
}

function makeDivIcon({ color, label, emoji }) {
  // Using Leaflet divIcon avoids dealing with image asset paths.
  const safeLabel = String(label ?? '')
  const safeEmoji = String(emoji ?? '')
  return L.divIcon({
    className: 'pet-help-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 20px rgba(2, 132, 199, 0.25);
        border: 2px solid rgba(255,255,255,0.95);
      ">
        <div style="color:#fff; font-weight:800; font-size:12px; line-height:1;">
          <div style="font-size:14px; margin-bottom:1px;">${safeEmoji}</div>
          <div>${safeLabel}</div>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -28],
  })
}

const ICONS = {
  help: makeDivIcon({ color: '#0ea5e9', label: 'HELP', emoji: '' }),
  urgent: makeDivIcon({ color: '#ef4444', label: 'URGENT', emoji: '🚨' }),
  service: makeDivIcon({ color: '#22c55e', label: 'VET', emoji: '' }),
  selectedRing: makeDivIcon({ color: '#0284c7', label: '', emoji: '●' }),
}

function useGeolocation() {
  const [status, setStatus] = useState('loading') // loading | success | denied | error
  const [pos, setPos] = useState(null)

  useEffect(() => {
    let cancelled = false

    if (!('geolocation' in navigator)) {
      setStatus('error')
      setPos(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (cancelled) return
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude })
        setStatus('success')
      },
      (err) => {
        if (cancelled) return
        if (err.code === 1) setStatus('denied')
        else setStatus('error')
        setPos(null)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return { status, pos }
}

function buildMockMarkers(center) {
  // TODO: replace with backend API integration later.
  // Mock points are derived from the user's location so the map feels "real-world".
  const lat = center.lat
  const lng = center.lng

  const mk = (id, kind, title, description, address, offsetKm, extra = {}) => {
    // 1 deg lat ~ 111 km. 1 deg lng ~ 111 km * cos(lat).
    const dLat = (offsetKm / 111) * 0.01 // small, stable offsets
    const dLng = (offsetKm / 111) * 0.01
    const signLat = id.charCodeAt(0) % 2 === 0 ? 1 : -1
    const signLng = id.charCodeAt(id.length - 1) % 2 === 0 ? 1 : -1
    const coords = {
      lat: lat + signLat * dLat,
      lng: lng + signLng * dLng,
    }
    return {
      id,
      kind, // 'help' | 'service'
      urgent: kind === 'help' ? !!extra.urgent : false,
      serviceCategory: kind === 'service' ? extra.serviceCategory : null, // 'vet' | 'grooming'
      title,
      description,
      address,
      coords,
    }
  }

  // New Delhi locations - vets, grooming, help posts
  return [
    mk(
      'help-1',
      'help',
      'Dog not eating',
      'My Labrador refused food for 24 hours. Any suggestions or nearby vet?',
      'Near Connaught Place, New Delhi',
      1.5,
      { urgent: false },
    ),
    mk(
      'help-2',
      'help',
      'Cat vomiting repeatedly',
      'My Persian cat is vomiting and seems weak. Need urgent guidance.',
      'Lajpat Nagar Market',
      2.1,
      { urgent: true },
    ),
    mk(
      'help-3',
      'help',
      'Lost small dog',
      'Brown Pomeranian lost near the park. Please contact if seen.',
      'Lodhi Garden entrance',
      2.8,
      { urgent: false },
    ),
    mk(
      'svc-1',
      'service',
      'Dr. Pets Veterinary Clinic',
      'Open today. Experienced vets for all pets. 24/7 emergency.',
      'Defence Colony, New Delhi',
      1.8,
      { serviceCategory: 'vet' },
    ),
    mk(
      'svc-2',
      'service',
      'Happy Tails Pet Spa & Grooming',
      'Professional grooming for dogs and cats. Walk-ins welcome.',
      'Greater Kailash-1, New Delhi',
      2.5,
      { serviceCategory: 'grooming' },
    ),
    mk(
      'svc-3',
      'service',
      'Max Pet Hospital',
      '24/7 emergency services, surgeries, and vaccinations.',
      'Saket, New Delhi',
      3.2,
      { serviceCategory: 'vet' },
    ),
    mk(
      'help-4',
      'help',
      'Puppy limping after walk',
      'My puppy started limping after morning walk. Need vet recommendation.',
      'Hauz Khas Village',
      1.9,
      { urgent: false },
    ),
    mk(
      'help-5',
      'help',
      '🚨 Found injured kitten',
      'Found a kitten with wound near metro station. Need urgent help!',
      'Rajiv Chowk Metro Station',
      0.8,
      { urgent: true },
    ),
    mk(
      'svc-4',
      'service',
      'Paws & Claws Vet Care',
      'Affordable pet care, vaccinations, and health checkups.',
      'Karol Bagh, New Delhi',
      2.3,
      { serviceCategory: 'vet' },
    ),
    mk(
      'svc-5',
      'service',
      'Fluffy Friends Grooming',
      'Premium grooming services. Appointment recommended.',
      'Vasant Kunj, New Delhi',
      4.5,
      { serviceCategory: 'grooming' },
    ),
    mk(
      'help-6',
      'help',
      'Need foster home for puppies',
      'Found 3 abandoned puppies. Looking for temporary foster homes.',
      'Nehru Place, New Delhi',
      3.1,
      { urgent: false },
    ),
  ]
}

function MapFocusOnSelection({ selected, zoom = 15 }) {
  const map = useMap()

  useEffect(() => {
    if (!selected) return
    // Fly to selected marker for a smooth "focus" experience.
    map.flyTo([selected.coords.lat, selected.coords.lng], zoom, { duration: 1.0 })
  }, [map, selected, zoom])

  return null
}

const CATEGORIES = [
  { value: 'lost_pet', label: 'Lost Pet' },
  { value: 'found_pet', label: 'Found Pet' },
  { value: 'medical_help', label: 'Medical Help' },
  { value: 'adoption', label: 'Adoption' },
  { value: 'foster', label: 'Foster Needed' },
  { value: 'general', label: 'General Help' },
]

export function MapBasedPetHelp() {
  const { status, pos } = useGeolocation()
  const [center, setCenter] = useState(FALLBACK_CENTER)
  const [geoError, setGeoError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [showVets, setShowVets] = useState(true)
  const [showHelpPosts, setShowHelpPosts] = useState(true)
  const [urgentOnly, setUrgentOnly] = useState(false)

  const [helpPosts, setHelpPosts] = useState([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    category: 'general',
    urgent: false,
    address: '',
    contactPhone: '',
    petType: '',
  })
  const [posting, setPosting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    loadHelpPosts()
  }, [])

  const loadHelpPosts = async () => {
    try {
      const posts = await api.getHelpPosts()
      setHelpPosts(posts)
    } catch {
      console.error('Failed to load help posts')
    }
  }

  useEffect(() => {
    if (status === 'success' && pos) {
      setCenter(pos)
      setGeoError(null)
    } else if (status === 'denied') {
      setCenter(FALLBACK_CENTER)
      setGeoError('Location access denied. Showing a demo area instead.')
    } else if (status === 'error') {
      setCenter(FALLBACK_CENTER)
      setGeoError('Could not get your location. Showing a demo area instead.')
    }
  }, [status, pos])

  const markers = useMemo(() => {
    const mockMarkers = buildMockMarkers(center).map((m) => {
      const distanceKm = haversineDistanceKm(center, m.coords)
      const distanceKmRounded = Math.round(distanceKm * 10) / 10
      return { ...m, distanceKm: distanceKmRounded }
    })

    const realPosts = helpPosts.map((p) => {
      const coords = { lat: p.location.lat, lng: p.location.lng }
      const distanceKm = haversineDistanceKm(center, coords)
      return {
        id: p._id,
        kind: 'help',
        urgent: p.urgent,
        title: p.title,
        description: p.description,
        address: p.location.address,
        coords,
        distanceKm: Math.round(distanceKm * 10) / 10,
        category: p.category,
        contactPhone: p.contactPhone,
        ownerName: p.owner?.name,
        isReal: true,
      }
    })

    return [...realPosts, ...mockMarkers]
  }, [center, helpPosts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return markers.filter((m) => {
      if (m.kind === 'service') {
        // Both vets + grooming are "green markers" in this UI.
        if (!showVets) return false
        if (urgentOnly) return false
      } else {
        // Help posts.
        if (!showHelpPosts) return false
        if (urgentOnly && !m.urgent) return false
      }

      if (!q) return true
      const hay = `${m.title} ${m.description} ${m.address}`.toLowerCase()
      return hay.includes(q)
    })
  }, [markers, query, showVets, showHelpPosts, urgentOnly])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return markers.find((m) => m.id === selectedId) || null
  }, [markers, selectedId])

  useEffect(() => {
    // If filters hide the currently selected marker, clear selection.
    if (!selectedId) return
    if (!filtered.some((m) => m.id === selectedId)) setSelectedId(null)
  }, [filtered, selectedId])

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPostForm((f) => ({
          ...f,
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        }))
        setGettingLocation(false)
      },
      () => {
        setGettingLocation(false)
        alert('Could not get your location')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!postForm.title.trim() || !postForm.description.trim() || !postForm.address.trim()) {
      alert('Please fill title, description and address')
      return
    }

    const lat = postForm.lat || center.lat
    const lng = postForm.lng || center.lng

    setPosting(true)
    try {
      await api.createHelpPost({
        title: postForm.title,
        description: postForm.description,
        category: postForm.category,
        urgent: postForm.urgent,
        location: { lat, lng, address: postForm.address },
        contactPhone: postForm.contactPhone,
        petType: postForm.petType,
      })
      setShowPostModal(false)
      setPostForm({
        title: '',
        description: '',
        category: 'general',
        urgent: false,
        address: '',
        contactPhone: '',
        petType: '',
      })
      loadHelpPosts()
    } catch (err) {
      alert(err.message || 'Failed to post. Please login first.')
    } finally {
      setPosting(false)
    }
  }

  // Leaflet + React-Leaflet: when the user selects from the list we also focus on it.
  const details = selected

  return (
    <div className="w-full">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-100/80 dark:border-slate-700/80 shadow-sm rounded-2xl p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowVets((v) => !v)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold ring-1 transition-colors',
                showVets
                  ? 'bg-green-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 ring-green-100 dark:ring-emerald-800'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 ring-slate-200 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600',
              ].join(' ')}
              aria-pressed={showVets}
            >
              Show Vets
            </button>
            <button
              type="button"
              onClick={() => setShowHelpPosts((v) => !v)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold ring-1 transition-colors',
                showHelpPosts
                  ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 ring-sky-100 dark:ring-sky-800'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 ring-slate-200 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600',
              ].join(' ')}
              aria-pressed={showHelpPosts}
            >
              Show Help Posts
            </button>
            <button
              type="button"
              onClick={() => setUrgentOnly((v) => !v)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold ring-1 transition-colors',
                urgentOnly
                  ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 ring-red-100 dark:ring-red-800'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 ring-slate-200 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600',
              ].join(' ')}
              aria-pressed={urgentOnly}
            >
              Urgent Only
            </button>
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Help Request
            </button>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nearby services or help..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
            />
          </div>
        </div>

        {(status === 'loading' || geoError) && (
          <div className="mt-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {status === 'loading' ? 'Getting your location…' : geoError}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative w-full h-[70vh] md:h-[75vh] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MarkerClusterGroup>
                {filtered.map((m) => {
                  const isSelected = m.id === selectedId
                  const icon = (() => {
                    if (m.kind === 'service') return ICONS.service
                    if (m.urgent) return ICONS.urgent
                    return ICONS.help
                  })()

                  const markerIcon = isSelected ? ICONS.selectedRing : icon

                  return (
                    <Marker
                      key={m.id}
                      position={[m.coords.lat, m.coords.lng]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => handleSelect(m.id),
                      }}
                    >
                      <Popup
                        maxWidth={330}
                        closeButton={false}
                        autoPan={true}
                        autoPanPadding={[25, 25]}
                      >
                        <div className="space-y-2">
                          <div className="font-bold text-slate-900">{m.title}</div>
                          <div className="text-sm text-slate-600">{m.description}</div>
                          <div className="text-xs text-slate-500">
                            Location: <span className="text-slate-700">{m.address}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Distance: <span className="font-semibold text-slate-700">{m.distanceKm} km</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedId(m.id)
                            }}
                            className="w-full rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MarkerClusterGroup>

              <MapFocusOnSelection selected={selected} />
            </MapContainer>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-100/80 dark:border-slate-700/80 shadow-sm rounded-2xl p-4 h-[70vh] md:h-[75vh] flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Nearby</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {filtered.length} results
                </div>
              </div>
            </div>

            <div className="overflow-auto flex-1 pr-1 space-y-2">
              {filtered.length === 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  No results match your filters.
                </div>
              )}

              {filtered.map((m) => {
                const isSelected = m.id === selectedId
                const badge =
                  m.kind === 'service'
                    ? m.serviceCategory === 'grooming'
                      ? 'GROOMING'
                      : 'VET'
                    : m.urgent
                      ? 'URGENT'
                      : 'HELP'

                const badgeClass =
                  m.kind === 'service'
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 ring-emerald-100 dark:ring-emerald-800'
                    : m.urgent
                      ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 ring-red-100 dark:ring-red-800'
                      : 'bg-sky-50 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 ring-sky-100 dark:ring-sky-800'

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelect(m.id)}
                    className={[
                      'w-full text-left rounded-2xl border p-3 transition-all',
                      isSelected
                        ? 'border-sky-200 dark:border-sky-600 bg-sky-50/80 dark:bg-sky-900/30 shadow-sm ring-1 ring-sky-100 dark:ring-sky-700'
                        : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.title}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{m.description}</div>
                      </div>
                      <div
                        className={[
                          'shrink-0 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold ring-1',
                          badgeClass,
                        ].join(' ')}
                      >
                        {badge}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between gap-2">
                      <span className="truncate">{m.address}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">{m.distanceKm} km</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {details && (
              <div className="mt-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{details.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{details.description}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Location: <span className="text-slate-700 dark:text-slate-200 font-medium">{details.address}</span>
                </div>
                {details.contactPhone && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Contact: <span className="text-slate-700 dark:text-slate-200 font-medium">{details.contactPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Post Help Request</h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Title *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Lost dog near park"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Description *</label>
                <textarea
                  value={postForm.description}
                  onChange={(e) => setPostForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your situation in detail..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Category</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Pet Type</label>
                  <input
                    type="text"
                    value={postForm.petType}
                    onChange={(e) => setPostForm((f) => ({ ...f, petType: e.target.value }))}
                    placeholder="e.g., Dog, Cat"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Address *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postForm.address}
                    onChange={(e) => setPostForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="e.g., Near Connaught Place"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                    title="Use current location"
                  >
                    <Locate className={`w-5 h-5 text-slate-600 dark:text-slate-200 ${gettingLocation ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
                {postForm.lat && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location captured
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={postForm.contactPhone}
                  onChange={(e) => setPostForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postForm.urgent}
                  onChange={(e) => setPostForm((f) => ({ ...f, urgent: e.target.checked }))}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-red-500 focus:ring-red-200"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mark as <span className="text-red-600 dark:text-red-400 font-semibold">URGENT</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={posting}
                className="w-full py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Post Help Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

