import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Dog, Cat } from 'lucide-react'
import { api } from '../api'

function typeIcon(type) {
  const t = (type || '').toLowerCase()
  if (t === 'cat') return Cat
  return Dog
}

export function PetsHub() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getPets()
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Your pets
          </h1>
          <p className="mt-2 text-slate-600 max-w-xl">
            Profiles, medical history, and schedules in one place.
          </p>
        </div>
        <Link
          to="/pets/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add pet
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl bg-white/60 border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-sky-200 bg-white/80 p-12 text-center">
          <p className="text-slate-600 mb-4">No pets yet. Add your first companion.</p>
          <Link
            to="/pets/new"
            className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700"
          >
            Add pet <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const Icon = typeIcon(pet.type)
            return (
              <Link
                key={pet._id}
                to={`/pets/${pet._id}`}
                className="group rounded-3xl bg-white border border-slate-100/80 p-6 shadow-card hover:shadow-soft hover:border-sky-100 transition-all duration-300 flex items-center gap-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-100 to-mint-100 flex items-center justify-center text-sky-600">
                  <Icon className="w-8 h-8" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-lg text-slate-900 truncate">
                    {pet.name}
                  </p>
                  <p className="text-sm text-slate-500 capitalize">
                    {pet.type} · {pet.age} yrs · {pet.weight} kg
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
