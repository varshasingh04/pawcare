import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Clock, Navigation, Stethoscope, Locate } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '../api'

function createVetIcon() {
  return L.divIcon({
    className: 'custom-vet-marker',
    html: `<div style="
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #0ea5e9 0%, #10b981 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      border: 2px solid white;
    "><span style="transform: rotate(45deg); font-size: 16px;">🏥</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

function createUserIcon() {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13)
    }
  }, [center, zoom, map])
  return null
}

export function VetFinder() {
  const [q, setQ] = useState('')
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [selectedVet, setSelectedVet] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.209 })
        },
      )
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.209 })
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      api
        .getVets(q)
        .then(setVets)
        .catch(() => setVets([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  const vetsWithCoords = useMemo(() => {
    if (!userLocation) return []
    return vets.map((v, i) => ({
      ...v,
      lat: userLocation.lat + (Math.random() - 0.5) * 0.05,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.05,
    }))
  }, [vets, userLocation])

  function centerOnUser() {
    if (!navigator.geolocation) return
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGettingLocation(false)
      },
      () => {
        setGettingLocation(false)
      },
    )
  }

  const vetIcon = useMemo(() => createVetIcon(), [])
  const userIcon = useMemo(() => createUserIcon(), [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          Find vets near you
        </h1>
        <p className="mt-2 text-gray-700 max-w-2xl">
          Compare ratings, distance, and same-day availability — book in a tap.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, specialty, or neighborhood…"
          className="search-input w-full rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          aria-label="Find vets near you"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/60 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 animate-pulse" />
              ))}
            </div>
          ) : vets.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-8">No vets match your search.</p>
          ) : (
            vetsWithCoords.map((v, idx) => (
              <article
                key={v._id}
                onClick={() => setSelectedVet(v)}
                className={`action-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                  selectedVet?._id === v._id
                    ? 'ring-2 ring-sky-400'
                    : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-50 dark:from-sky-900/50 dark:to-teal-900/50 text-sky-600 dark:text-sky-400">
                    <Stethoscope className="w-7 h-7" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <h2 className="font-display text-lg font-bold">{v.name}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {v.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 text-sky-500 dark:text-sky-400" />
                      {v.address}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <Navigation className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                        <span className="font-medium">{v.distanceKm} km</span>
                        <span className="text-gray-500">away</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          v.availableToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {v.availability}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/appointments/book"
                    state={{ vetName: v.name }}
                    onClick={(e) => e.stopPropagation()}
                    className="sm:self-center shrink-0 rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 transition-colors text-center"
                  >
                    Book
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl action-card overflow-hidden shadow-sm">
            <div className="aspect-[4/3] relative">
              {userLocation ? (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController
                    center={selectedVet ? [selectedVet.lat, selectedVet.lng] : [userLocation.lat, userLocation.lng]}
                    zoom={selectedVet ? 15 : 13}
                  />
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                      <span className="font-semibold">You are here</span>
                    </Popup>
                  </Marker>
                  {vetsWithCoords.map((v) => (
                    <Marker key={v._id} position={[v.lat, v.lng]} icon={vetIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold text-slate-900">{v.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{v.address}</p>
                          <p className="text-xs text-emerald-600 font-medium mt-1">{v.distanceKm} km away</p>
                          <Link
                            to="/appointments/book"
                            state={{ vetName: v.name }}
                            className="inline-block mt-2 px-3 py-1 bg-sky-500 text-white text-xs font-semibold rounded-lg hover:bg-sky-600"
                          >
                            Book Now
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                  <div className="h-8 w-8 rounded-full border-2 border-sky-200 dark:border-sky-700 border-t-sky-500 animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={centerOnUser}
                disabled={gettingLocation}
                className="absolute bottom-3 right-3 z-[1000] p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-600 transition-colors disabled:opacity-50"
                title="Center on my location"
              >
                <Locate className={`w-5 h-5 ${gettingLocation ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Your location
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500"></span>
                  Vet clinics
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
