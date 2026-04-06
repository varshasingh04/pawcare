import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Printer, Phone, Mail, MapPin, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import { api } from '../api'

export function LostPoster() {
  const { petId } = useParams()
  const [pet, setPet] = useState(null)
  const [lostReport, setLostReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const posterRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [petData, reportData] = await Promise.all([
          api.getPet(petId),
          api.getLostReport(petId).catch(() => null),
        ])
        setPet(petData)
        setLostReport(reportData)
      } catch {
        setPet(null)
      }
      setLoading(false)
    }
    load()
  }, [petId])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
      </div>
    )
  }

  if (!pet || !lostReport || lostReport.status !== 'lost') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-4">No Lost Report Found</h1>
        <p className="text-slate-600 mb-6">This pet is not currently marked as lost.</p>
        <Link
          to={`/pets/${petId}`}
          className="text-sky-600 hover:text-sky-700 font-semibold"
        >
          Back to pet profile
        </Link>
      </div>
    )
  }

  const scanUrl = pet.shareToken
    ? `${window.location.origin}/pet/scan/${pet.shareToken}`
    : null

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          to={`/pets/${petId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pet
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <Printer className="w-4 h-4" />
            Print Poster
          </button>
        </div>
      </div>

      <div
        ref={posterRef}
        className="bg-white border-4 border-red-500 rounded-2xl p-8 shadow-xl print:shadow-none print:border-8 print:rounded-none"
      >
        <div className="text-center mb-6">
          <div className="inline-block bg-red-500 text-white px-8 py-3 rounded-xl">
            <h1 className="text-4xl sm:text-5xl font-black tracking-wider">LOST PET</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="shrink-0 text-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-8xl sm:text-9xl border-4 border-slate-300">
              {pet.photoEmoji || '🐾'}
            </div>
            <p className="mt-3 text-sm text-slate-500">Photo of {pet.name}</p>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900">{pet.name}</h2>
              <p className="text-xl text-slate-600 mt-1 capitalize">
                {pet.breed || pet.type} · {pet.age} years old
              </p>
            </div>

            {lostReport.reward && (
              <div className="bg-amber-100 border-2 border-amber-400 rounded-xl px-4 py-3">
                <p className="text-amber-900 font-bold text-lg">
                  💰 REWARD: {lostReport.reward}
                </p>
              </div>
            )}

            <div className="space-y-2 text-slate-700">
              {lostReport.wearing && (
                <p>
                  <span className="font-semibold">Wearing:</span> {lostReport.wearing}
                </p>
              )}
              {lostReport.description && (
                <p>
                  <span className="font-semibold">Description:</span> {lostReport.description}
                </p>
              )}
              {lostReport.behaviorNotes && (
                <p>
                  <span className="font-semibold">Behavior:</span> {lostReport.behaviorNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase mb-2">
              <MapPin className="w-4 h-4" />
              Last Seen
            </div>
            <p className="text-slate-900 font-semibold text-lg">
              {lostReport.lastSeenLocation?.address || 'Unknown location'}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {formatDate(lostReport.lastSeenDate)}
            </p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <div className="text-emerald-700 text-sm font-semibold uppercase mb-3">
              Contact Owner
            </div>
            <div className="space-y-2">
              {lostReport.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <span className="text-lg font-bold text-emerald-900">{lostReport.contactPhone}</span>
                </div>
              )}
              {lostReport.contactWhatsApp && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">WhatsApp: {lostReport.contactWhatsApp}</span>
                </div>
              )}
              {lostReport.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-600" />
                  <span className="text-slate-700">{lostReport.contactEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {scanUrl && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-sky-50 rounded-xl border border-sky-200">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <QRCode value={scanUrl} size={120} level="M" />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 text-sky-700 font-semibold mb-1">
                <QrCode className="w-5 h-5" />
                Scan to Report Sighting
              </div>
              <p className="text-sm text-slate-600 max-w-xs">
                Scan this QR code to instantly contact the owner and report where you saw {pet.name}.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-slate-400 text-sm">
          Please help bring {pet.name} home! · Created with PawCare
        </div>
      </div>

      <div className="text-center text-slate-500 text-sm print:hidden">
        <p>Tip: Print multiple copies and post in your neighborhood, local vets, and pet stores.</p>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [data-poster], [data-poster] * {
            visibility: visible;
          }
          [data-poster] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
