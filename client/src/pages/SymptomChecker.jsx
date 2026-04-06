import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope, ArrowLeft, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { api } from '../api'

const COMMON_SYMPTOMS = {
  dog: [
    'Loss of appetite',
    'Vomiting',
    'Diarrhea',
    'Lethargy / Weakness',
    'Coughing',
    'Sneezing',
    'Excessive scratching',
    'Hair loss',
    'Limping',
    'Difficulty breathing',
    'Excessive thirst',
    'Frequent urination',
    'Weight loss',
    'Swelling',
    'Bad breath',
    'Eye discharge',
    'Ear scratching',
    'Runny nose',
  ],
  cat: [
    'Loss of appetite',
    'Vomiting',
    'Diarrhea',
    'Lethargy / Weakness',
    'Hiding more than usual',
    'Excessive grooming',
    'Hair loss',
    'Sneezing',
    'Coughing',
    'Difficulty breathing',
    'Excessive thirst',
    'Frequent urination',
    'Weight loss',
    'Crying when urinating',
    'Eye discharge',
    'Ear scratching',
    'Not using litter box',
  ],
  bird: [
    'Loss of appetite',
    'Fluffed up feathers',
    'Lethargy / Weakness',
    'Difficulty breathing',
    'Tail bobbing',
    'Discharge from eyes/nose',
    'Change in droppings',
    'Feather plucking',
    'Weight loss',
    'Sneezing',
    'Loss of balance',
    'Not singing/vocalizing',
  ],
}

export function SymptomChecker() {
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [petType, setPetType] = useState('dog')
  const [petAge, setPetAge] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [additionalInfo, setAdditionalInfo] = useState('')
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
      setPetType(pet.type?.toLowerCase() || 'dog')
      setPetAge(pet.age?.toString() || '')
    }
  }

  function toggleSymptom(symptom) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.checkSymptoms({
        petType,
        petAge: petAge || 'unknown',
        symptoms: selectedSymptoms,
        additionalInfo,
      })
      setResult(response.analysis)
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms. Please try again.')
    }
    setLoading(false)
  }

  function reset() {
    setSelectedSymptoms([])
    setAdditionalInfo('')
    setResult(null)
    setError(null)
  }

  const symptoms = COMMON_SYMPTOMS[petType] || COMMON_SYMPTOMS.dog

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
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Powered
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
          Pet Symptom Checker
        </h1>
        <p className="mt-2 text-slate-600">
          Select your pet's symptoms and get AI-powered guidance on possible conditions.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-card space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Pet
                </label>
                <select
                  value={selectedPet?._id || ''}
                  onChange={(e) => handlePetSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="">Enter manually</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.photoEmoji} {pet.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pet Type</label>
                <select
                  value={petType}
                  onChange={(e) => {
                    setPetType(e.target.value)
                    setSelectedSymptoms([])
                  }}
                  disabled={!!selectedPet}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Age (years)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g., 3"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                  disabled={!!selectedPet}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Symptoms <span className="text-slate-400 font-normal">(click all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
              {selectedSymptoms.length > 0 && (
                <p className="mt-3 text-sm text-violet-600 font-medium">
                  {selectedSymptoms.length} symptom(s) selected
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Additional Information <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="Any other details? When did symptoms start? Any recent changes in diet or environment?"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
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
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> This AI tool provides general guidance only and is not a
              substitute for professional veterinary care. Always consult a veterinarian for proper
              diagnosis and treatment.
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-slate-900">AI Analysis</h2>
                <p className="text-sm text-slate-500">Based on: {selectedSymptoms.join(', ')}</p>
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Check Different Symptoms
            </button>
            <Link
              to="/vets"
              className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white text-center shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
            >
              Find a Vet
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
