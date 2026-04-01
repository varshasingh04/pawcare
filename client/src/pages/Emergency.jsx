import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Siren, HeartPulse, Shield } from 'lucide-react'
import { api } from '../api'

const FIRST_AID = [
  {
    title: 'Stay calm & assess',
    body: 'Move your pet to a safe, quiet space. Check breathing and responsiveness without startling them.',
  },
  {
    title: 'Bleeding',
    body: 'Apply firm pressure with a clean cloth. Elevate the limb if possible and head to emergency care.',
  },
  {
    title: 'Heatstroke',
    body: 'Cool gradually with lukewarm water and fans — avoid ice-cold water. Offer small sips of water if alert.',
  },
  {
    title: 'Poisoning suspicion',
    body: 'Do not induce vomiting unless a vet instructs you. Keep packaging and call a poison helpline or ER vet.',
  },
]

export function Emergency() {
  const [vets, setVets] = useState([])

  useEffect(() => {
    api.getEmergencyVets().then(setVets).catch(() => setVets([]))
  }, [])

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-800 px-4 py-1.5 text-sm font-semibold">
          <Siren className="w-4 h-4" />
          Emergency resources
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          When every minute counts
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          One-tap access to nearby emergency vets. For life-threatening situations, call local emergency services.
        </p>
        <a
          href="tel:911"
          className="inline-flex items-center justify-center gap-3 rounded-3xl bg-red-600 hover:bg-red-700 text-white px-10 py-5 text-lg font-bold shadow-xl shadow-red-600/30 transition-colors min-w-[280px]"
        >
          <Siren className="w-7 h-7" />
          Emergency help
        </a>
        <p className="text-xs text-slate-400">Tap calls your device emergency line (e.g. 911). Adjust for your region in production.</p>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-red-500" />
          Nearby emergency vets
        </h2>
        <ul className="space-y-3">
          {vets.length === 0 && (
            <li className="text-slate-500 text-sm">Loading or unavailable — start the API server.</li>
          )}
          {vets.map((v) => (
            <li
              key={v._id}
              className="rounded-3xl border border-red-100 bg-red-50/40 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="font-display font-bold text-slate-900">{v.name}</p>
                <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  {v.address}
                </p>
                <p className="text-sm text-slate-500 mt-1">{v.distanceKm} km · Open {v.hours || '24/7'}</p>
              </div>
              <a
                href={`tel:${v.phone?.replace(/\s/g, '') || ''}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 shrink-0"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-card">
        <h2 className="font-display text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-sky-600" />
          Basic first aid
        </h2>
        <p className="text-sm text-slate-500 mb-6">General guidance — not a substitute for professional care.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIRST_AID.map((item) => (
            <div key={item.title} className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link to="/" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
