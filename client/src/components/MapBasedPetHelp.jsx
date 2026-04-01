import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const FALLBACK_CENTER = { lat: 40.7128, lng: -74.006 } // NYC-ish fallback
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

  // A small mix: vets, grooming, normal help posts, and urgent help posts.
  return [
    mk(
      'help-1',
      'help',
      'Dog not eating',
      'My dog refused food for 24 hours. Any suggestions or nearby urgent help?',
      'Near Oak St & 3rd Ave',
      2.1,
      { urgent: false },
    ),
    mk(
      'help-2',
      'help',
      'Cat vomiting repeatedly',
      'My cat is vomiting and seems weak. Looking for urgent guidance.',
      'Downtown Market (approx.)',
      1.3,
      { urgent: true },
    ),
    mk(
      'help-3',
      'help',
      'Lost small dog',
      'Brown/white terrier lost near the park. Please contact if you see him.',
      'Riverside Park entrance',
      3.6,
      { urgent: false },
    ),
    mk(
      'svc-1',
      'service',
      'BrightPaws Animal Hospital',
      'Open today. Experienced vets for urgent and routine visits.',
      '12 Maple Ave, Downtown',
      2.0,
      { serviceCategory: 'vet' },
    ),
    mk(
      'svc-2',
      'service',
      'Sunrise Pet Wellness (Grooming)',
      'Gentle grooming for dogs and cats. Walk-ins available.',
      '400 Oak St',
      2.7,
      { serviceCategory: 'grooming' },
    ),
    mk(
      'svc-3',
      'service',
      'Harbor Veterinary Center',
      '24/7 emergency services and pet health consultations.',
      '2 Harbor View',
      4.1,
      { serviceCategory: 'vet' },
    ),
    mk(
      'help-4',
      'help',
      'Puppy limping',
      'Puppy limping after playing. Looking for a nearby vet to check today.',
      'Central Library area',
      1.9,
      { urgent: false },
    ),
    mk(
      'help-5',
      'help',
      '🚨 Found injured kitten',
      'Found a kitten with a possible wound. Need urgent help / vet referral.',
      'Eastside Station (approx.)',
      2.4,
      { urgent: true },
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

export function MapBasedPetHelp() {
  const { status, pos } = useGeolocation()
  const [center, setCenter] = useState(FALLBACK_CENTER)
  const [geoError, setGeoError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [showVets, setShowVets] = useState(true)
  const [showHelpPosts, setShowHelpPosts] = useState(true)
  const [urgentOnly, setUrgentOnly] = useState(false)

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
    return buildMockMarkers(center).map((m) => {
      const distanceKm = haversineDistanceKm(center, m.coords)
      const distanceKmRounded = Math.round(distanceKm * 10) / 10
      return { ...m, distanceKm: distanceKmRounded }
    })
  }, [center])

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

  // Leaflet + React-Leaflet: when the user selects from the list we also focus on it.
  const details = selected

  return (
    <div className="w-full">
      <div className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-2xl p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowVets((v) => !v)}
              className={[
                'px-4 py-2 rounded-full text-sm font-semibold ring-1 transition-colors',
                showVets ? 'bg-green-50 text-emerald-800 ring-green-100' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
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
                showHelpPosts ? 'bg-sky-50 text-sky-800 ring-sky-100' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
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
                urgentOnly ? 'bg-red-50 text-red-700 ring-red-100' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
              aria-pressed={urgentOnly}
            >
              Urgent Only
            </button>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nearby services or help..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
            />
          </div>
        </div>

        {(status === 'loading' || geoError) && (
          <div className="mt-3">
            <div className="text-sm text-slate-600">
              {status === 'loading' ? 'Getting your location…' : geoError}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative w-full h-[70vh] md:h-[75vh] rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white">
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
          <div className="bg-white/70 backdrop-blur-sm border border-slate-100/80 shadow-sm rounded-2xl p-4 h-[70vh] md:h-[75vh] flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">Nearby</div>
                <div className="text-xs text-slate-500">
                  {filtered.length} results
                </div>
              </div>
            </div>

            <div className="overflow-auto flex-1 pr-1 space-y-2">
              {filtered.length === 0 && (
                <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded-xl">
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
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
                    : m.urgent
                      ? 'bg-red-50 text-red-700 ring-red-100'
                      : 'bg-sky-50 text-sky-800 ring-sky-100'

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelect(m.id)}
                    className={[
                      'w-full text-left rounded-2xl border p-3 transition-all',
                      isSelected
                        ? 'border-sky-200 bg-sky-50/80 shadow-sm ring-1 ring-sky-100'
                        : 'border-slate-100 bg-white hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{m.title}</div>
                        <div className="text-xs text-slate-600 mt-1 line-clamp-2">{m.description}</div>
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

                    <div className="text-xs text-slate-500 mt-2 flex items-center justify-between gap-2">
                      <span className="truncate">{m.address}</span>
                      <span className="font-semibold text-slate-700 shrink-0">{m.distanceKm} km</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {details && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="text-sm font-semibold text-slate-900">{details.title}</div>
                <div className="text-sm text-slate-600 mt-1">{details.description}</div>
                <div className="text-xs text-slate-500 mt-2">
                  Location: <span className="text-slate-700 font-medium">{details.address}</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

