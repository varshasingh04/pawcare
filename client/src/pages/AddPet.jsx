import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PawPrint, ArrowLeft } from 'lucide-react'
import { api } from '../api'

const TYPES = ['Dog', 'Cat', 'Bird']
const GENDERS = ['male', 'female']

function supportsHeatTracking(petType) {
  const t = (petType || '').toLowerCase()
  return t === 'dog' || t === 'cat'
}

export function AddPet() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    type: 'Dog',
    age: '',
    weight: '',
    breed: '',
    gender: 'male',
    reproductiveStatus: 'intact',
    lastHeatDate: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const showGenderField = supportsHeatTracking(form.type)
  const showReproductiveStatus = showGenderField && form.gender === 'female'
  const showHeatDateField = showReproductiveStatus && form.reproductiveStatus === 'intact'

  function update(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        age: Number(form.age),
        weight: Number(form.weight),
        breed: form.breed.trim() || undefined,
      }

      if (showGenderField) {
        payload.gender = form.gender
        if (form.gender === 'female') {
          payload.reproductiveStatus = form.reproductiveStatus
          if (showHeatDateField && form.lastHeatDate) {
            payload.lastHeatDate = form.lastHeatDate
          }
        }
      }

      const pet = await api.createPet(payload)
      navigate(`/pets/${pet._id}`, { replace: true, state: { pet } })
      return
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <Link
        to="/pets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="text-center sm:text-left">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mb-4">
          <PawPrint className="w-7 h-7" strokeWidth={2} />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Add a pet</h1>
        <p className="mt-2 text-slate-600">A few details — we&apos;ll handle reminders and history.</p>
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

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={update}
            placeholder="e.g. Luna"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={update}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
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
            <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-2">
              Age (years)
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min="0"
              step="0.1"
              required
              value={form.age}
              onChange={update}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-semibold text-slate-700 mb-2">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              min="0"
              step="0.1"
              required
              value={form.weight}
              onChange={update}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="breed" className="block text-sm font-semibold text-slate-700 mb-2">
            Breed <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="breed"
            name="breed"
            value={form.breed}
            onChange={update}
            placeholder="e.g. Golden Retriever"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
        </div>

        {showGenderField && (
          <>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-2">
                Gender
              </label>
              <div className="flex gap-3">
                {GENDERS.map((g) => (
                  <label
                    key={g}
                    className={[
                      'flex-1 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 cursor-pointer transition-all',
                      form.gender === g
                        ? 'border-sky-400 bg-sky-50 text-sky-700 ring-2 ring-sky-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={update}
                      className="sr-only"
                    />
                    <span className="text-lg">{g === 'male' ? '♂️' : '♀️'}</span>
                    <span className="capitalize font-medium">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {showReproductiveStatus && (
              <div>
                <label htmlFor="reproductiveStatus" className="block text-sm font-semibold text-slate-700 mb-2">
                  Is she spayed?
                </label>
                <div className="flex gap-3">
                  <label
                    className={[
                      'flex-1 flex items-center justify-center rounded-2xl border px-4 py-3 cursor-pointer transition-all',
                      form.reproductiveStatus === 'intact'
                        ? 'border-sky-400 bg-sky-50 text-sky-700 ring-2 ring-sky-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="reproductiveStatus"
                      value="intact"
                      checked={form.reproductiveStatus === 'intact'}
                      onChange={update}
                      className="sr-only"
                    />
                    <span className="font-medium">No (Intact)</span>
                  </label>
                  <label
                    className={[
                      'flex-1 flex items-center justify-center rounded-2xl border px-4 py-3 cursor-pointer transition-all',
                      form.reproductiveStatus === 'spayed'
                        ? 'border-sky-400 bg-sky-50 text-sky-700 ring-2 ring-sky-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="reproductiveStatus"
                      value="spayed"
                      checked={form.reproductiveStatus === 'spayed'}
                      onChange={update}
                      className="sr-only"
                    />
                    <span className="font-medium">Yes (Spayed)</span>
                  </label>
                </div>
              </div>
            )}

            {showHeatDateField && (
              <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4">
                <label htmlFor="lastHeatDate" className="block text-sm font-semibold text-pink-800 mb-2">
                  Last heat cycle date <span className="text-pink-400 font-normal">(optional)</span>
                </label>
                <input
                  id="lastHeatDate"
                  name="lastHeatDate"
                  type="date"
                  value={form.lastHeatDate}
                  onChange={update}
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                />
                <p className="text-xs text-pink-600 mt-2">
                  We&apos;ll help you track and predict future cycles for better care.
                </p>
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-60 transition-colors"
        >
          {submitting ? 'Saving…' : 'Save pet'}
        </button>
      </form>
    </div>
  )
}
