import { useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, FileImage, X, Shield } from 'lucide-react'
import { api } from '../api'

const VACCINE_TYPES = [
  { value: 'rabies', label: 'Rabies', pets: ['dog', 'cat'] },
  { value: 'dhpp', label: 'DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)', pets: ['dog'] },
  { value: 'bordetella', label: 'Bordetella (Kennel Cough)', pets: ['dog'] },
  { value: 'leptospirosis', label: 'Leptospirosis', pets: ['dog'] },
  { value: 'lyme', label: 'Lyme Disease', pets: ['dog'] },
  { value: 'canine_influenza', label: 'Canine Influenza', pets: ['dog'] },
  { value: 'fvrcp', label: 'FVRCP (Feline Distemper)', pets: ['cat'] },
  { value: 'felv', label: 'FeLV (Feline Leukemia)', pets: ['cat'] },
  { value: 'deworming', label: 'Deworming', pets: ['dog', 'cat'] },
  { value: 'flea_tick', label: 'Flea & Tick Prevention', pets: ['dog', 'cat'] },
  { value: 'other', label: 'Other', pets: ['dog', 'cat', 'bird'] },
]

const VACCINE_INTERVALS = {
  rabies: 365,
  dhpp: 365,
  bordetella: 180,
  leptospirosis: 365,
  lyme: 365,
  canine_influenza: 365,
  fvrcp: 365,
  felv: 365,
  deworming: 90,
  flea_tick: 30,
  other: 365,
}

function calculateNextDue(dateGiven, vaccineType) {
  const days = VACCINE_INTERVALS[vaccineType] || 365
  const next = new Date(dateGiven)
  next.setDate(next.getDate() + days)
  return next.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function AddVaccination() {
  const { petId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    vaccineType: 'rabies',
    dateGiven: new Date().toISOString().split('T')[0],
    vetName: '',
    notes: '',
  })
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image or PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setProofFile(file)
    setError(null)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setProofPreview(e.target?.result)
      reader.readAsDataURL(file)
    } else {
      setProofPreview('pdf')
    }
  }

  function removeProof() {
    setProofFile(null)
    setProofPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!proofFile) {
      setError('Proof from vet is required. Please upload receipt or certificate.')
      return
    }

    setSubmitting(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result
          
          await api.addVaccination(petId, {
            vaccineType: form.vaccineType,
            dateGiven: form.dateGiven,
            vetName: form.vetName.trim(),
            notes: form.notes.trim(),
            proofImage: base64,
            proofMimeType: proofFile.type,
          })

          navigate(`/pets/${petId}`, { replace: true })
        } catch (err) {
          setError(err.message || 'Failed to save vaccination record')
          setSubmitting(false)
        }
      }
      reader.readAsDataURL(proofFile)
    } catch (err) {
      setError(err.message || 'Something went wrong')
      setSubmitting(false)
    }
  }

  const nextDueDate = calculateNextDue(form.dateGiven, form.vaccineType)

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <Link
        to={`/pets/${petId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to pet
      </Link>

      <div className="text-center sm:text-left">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
          <Shield className="w-7 h-7" strokeWidth={2} />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
          Add Vaccination Record
        </h1>
        <p className="mt-2 text-slate-600">
          Upload proof from your vet to create a verified record.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-card space-y-6"
      >
        {error && (
          <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-100">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Proof Required</p>
              <p className="text-amber-700 text-sm mt-1">
                Upload vet receipt or certificate. Records without proof cannot be saved.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Vet Receipt / Certificate *
          </label>
          {proofPreview ? (
            <div className="relative rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <button
                type="button"
                onClick={removeProof}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md hover:bg-red-50 text-slate-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {proofPreview === 'pdf' ? (
                <div className="flex items-center gap-3">
                  <FileImage className="w-10 h-10 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">{proofFile?.name}</p>
                    <p className="text-sm text-slate-500">PDF document</p>
                  </div>
                </div>
              ) : (
                <img
                  src={proofPreview}
                  alt="Proof preview"
                  className="max-h-48 rounded-xl mx-auto"
                />
              )}
              <p className="text-center text-sm text-emerald-700 mt-3 font-medium">
                Proof uploaded successfully
              </p>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Click to upload</p>
              <p className="text-xs text-slate-500 mt-1">Image or PDF, max 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <div>
          <label htmlFor="vaccineType" className="block text-sm font-semibold text-slate-700 mb-2">
            Vaccine Type *
          </label>
          <select
            id="vaccineType"
            name="vaccineType"
            value={form.vaccineType}
            onChange={update}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          >
            {VACCINE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateGiven" className="block text-sm font-semibold text-slate-700 mb-2">
              Date Given *
            </label>
            <input
              id="dateGiven"
              name="dateGiven"
              type="date"
              required
              value={form.dateGiven}
              onChange={update}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Next Due</label>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 font-medium text-sm">
              {nextDueDate}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="vetName" className="block text-sm font-semibold text-slate-700 mb-2">
            Vet / Clinic Name *
          </label>
          <input
            id="vetName"
            name="vetName"
            required
            value={form.vetName}
            onChange={update}
            placeholder="e.g. BrightPaws Animal Hospital"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="notes"
            name="notes"
            value={form.notes}
            onChange={update}
            placeholder="e.g. No adverse reactions"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
        </div>

        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
          <p className="text-sm text-sky-800">
            <strong>Auto-reminder:</strong> A reminder for the next dose will be created automatically.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !proofFile}
          className="w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving…' : 'Save Vaccination Record'}
        </button>
      </form>
    </div>
  )
}
