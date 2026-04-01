import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Clock, Navigation, Stethoscope } from 'lucide-react'
import { api } from '../api'

export function VetFinder() {
  const [q, setQ] = useState('')
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Find vets near you
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Compare ratings, distance, and same-day availability — book in a tap.
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, specialty, or neighborhood…"
          className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          aria-label="Find vets near you"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/60 border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : vets.length === 0 ? (
            <p className="text-slate-500 py-8">No vets match your search.</p>
          ) : (
            vets.map((v) => (
              <article
                key={v._id}
                className="rounded-3xl bg-white border border-slate-100/90 p-6 shadow-card hover:shadow-soft hover:border-sky-100/80 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-mint-50 text-sky-600">
                    <Stethoscope className="w-7 h-7" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <h2 className="font-display text-lg font-bold text-slate-900">{v.name}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {v.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0 text-sky-500" />
                      {v.address}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Navigation className="w-4 h-4 text-mint-500" />
                        <span className="font-medium text-slate-800">{v.distanceKm} km</span>
                        <span className="text-slate-400">away</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          v.availableToday ? 'text-emerald-700' : 'text-slate-500'
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
          <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-card">
            <div className="aspect-[4/3] bg-gradient-to-br from-sky-100 via-white to-mint-50 relative">
              <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-sky-200/80 bg-sky-50/50 flex flex-col items-center justify-center text-center p-4">
                <MapPin className="w-10 h-10 text-sky-500 mb-2" />
                <p className="font-display font-semibold text-slate-800">Map integration</p>
                <p className="text-sm text-slate-500 mt-1">
                  Connect Google Maps or Mapbox here to show clinics around your location.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 leading-relaxed">
                Production apps typically embed an interactive map with markers synced to the vet list
                above.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
