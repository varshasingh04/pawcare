import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Mail, Phone, PawPrint, User, Heart } from 'lucide-react'
import { api } from '../api'

export function PetScan() {
  const { shareToken } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

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

  const { pet, owner } = data

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
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner
              </h2>
              <p className="font-display text-xl font-bold text-slate-900">{owner.name}</p>
            </div>

            <ul className="space-y-3">
              {owner.phone && (
                <li>
                  <a
                    href={`tel:${owner.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-slate-800 hover:border-sky-200 hover:bg-sky-50/50 transition-colors"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-100 text-emerald-700">
                      <Phone className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-500">Phone</p>
                      <p className="font-medium">{owner.phone}</p>
                    </div>
                  </a>
                </li>
              )}
              {owner.email && (
                <li>
                  <a
                    href={`mailto:${owner.email}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-slate-800 hover:border-sky-200 hover:bg-sky-50/50 transition-colors"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <Mail className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-500">Email</p>
                      <p className="font-medium truncate">{owner.email}</p>
                    </div>
                  </a>
                </li>
              )}
              {!owner.phone && !owner.email && (
                <li className="text-sm text-slate-500">No contact details on file.</li>
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
