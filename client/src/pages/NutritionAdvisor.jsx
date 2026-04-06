import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Utensils, ArrowLeft, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { api } from '../api'

const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Low - Mostly resting, minimal exercise' },
  { value: 'moderate', label: 'Moderate - Regular walks/play, average activity' },
  { value: 'high', label: 'High - Very active, lots of exercise' },
  { value: 'working', label: 'Working/Sport - Athletic, intense activity' },
]

const COMMON_CONDITIONS = {
  dog: ['Obesity', 'Allergies', 'Joint problems', 'Diabetes', 'Kidney disease', 'Heart disease', 'Sensitive stomach'],
  cat: ['Obesity', 'Diabetes', 'Kidney disease', 'Urinary issues', 'Allergies', 'Hairballs', 'Sensitive stomach'],
  bird: ['Obesity', 'Vitamin deficiency', 'Liver problems', 'Feather plucking'],
}

export function NutritionAdvisor() {
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [form, setForm] = useState({
    petType: 'dog',
    breed: '',
    age: '',
    weight: '',
    activityLevel: 'moderate',
    healthConditions: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getPets().then(setPets).catch(() => setPets([]))
  }, [])

  function handlePetSelect(petId) {
    if (!petId) {
      setSelectedPet(null)
      return
    }
    const pet = pets.find((p) => p._id === petId)
    if (pet) {
      setSelectedPet(pet)
      setForm((f) => ({
        ...f,
        petType: pet.type?.toLowerCase() || 'dog',
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        weight: pet.weight?.toString() || '',
      }))
    }
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.age || !form.weight) {
      setError('Please enter age and weight')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.getNutritionAdvice({
        petType: form.petType,
        breed: form.breed,
        age: form.age,
        weight: form.weight,
        activityLevel: form.activityLevel,
        healthConditions: form.healthConditions,
      })
      setResult(response.advice)
    } catch (err) {
      setError(err.message || 'Failed to get nutrition advice. Please try again.')
    }
    setLoading(false)
  }

  function reset() {
    setForm({
      petType: selectedPet?.type?.toLowerCase() || 'dog',
      breed: selectedPet?.breed || '',
      age: selectedPet?.age?.toString() || '',
      weight: selectedPet?.weight?.toString() || '',
      activityLevel: 'moderate',
      healthConditions: '',
    })
    setResult(null)
    setError(null)
  }

  const conditions = COMMON_CONDITIONS[form.petType] || COMMON_CONDITIONS.dog

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
            <Utensils className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Powered
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
          Pet Nutrition Advisor
        </h1>
        <p className="mt-2 text-slate-600">
          Get personalized diet recommendations based on your pet's profile.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Your Pet
              </label>
              <select
                value={selectedPet?._id || ''}
                onChange={(e) => handlePetSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <option value="">Enter details manually</option>
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.photoEmoji} {pet.name} ({pet.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pet Type</label>
                <select
                  value={form.petType}
                  onChange={(e) => updateForm('petType', e.target.value)}
                  disabled={!!selectedPet}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-50"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Breed <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Golden Retriever"
                  value={form.breed}
                  onChange={(e) => updateForm('breed', e.target.value)}
                  disabled={!!selectedPet}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Age (years) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  placeholder="e.g., 3"
                  value={form.age}
                  onChange={(e) => updateForm('age', e.target.value)}
                  disabled={!!selectedPet}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  placeholder="e.g., 25"
                  value={form.weight}
                  onChange={(e) => updateForm('weight', e.target.value)}
                  disabled={!!selectedPet}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Activity Level
              </label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.activityLevel === level.value
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="activityLevel"
                      value={level.value}
                      checked={form.activityLevel === level.value}
                      onChange={(e) => updateForm('activityLevel', e.target.value)}
                      className="w-4 h-4 text-emerald-500"
                    />
                    <span className="text-sm text-slate-700">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Health Conditions <span className="text-slate-400 font-normal">(if any)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {conditions.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => {
                      const current = form.healthConditions
                      if (current.includes(condition)) {
                        updateForm('healthConditions', current.replace(condition, '').replace(/, ,/g, ', ').replace(/^, |, $/g, ''))
                      } else {
                        updateForm('healthConditions', current ? `${current}, ${condition}` : condition)
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      form.healthConditions.includes(condition)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type other conditions..."
                value={form.healthConditions}
                onChange={(e) => updateForm('healthConditions', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.age || !form.weight}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting nutrition advice...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get Nutrition Plan
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900">Personalized Nutrition Plan</h2>
                <p className="text-sm text-slate-500">
                  For your {form.age}yr old, {form.weight}kg {form.breed || form.petType}
                </p>
              </div>
            </div>
            <div
              className="prose prose-slate prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: result
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />'),
              }}
            />
          </div>

          <button
            type="button"
            onClick={reset}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Get Advice for Another Pet
          </button>
        </div>
      )}

      <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> This AI provides general nutrition guidance. Individual needs may
          vary. Consult your veterinarian before making significant dietary changes, especially for
          pets with health conditions.
        </p>
      </div>
    </div>
  )
}
