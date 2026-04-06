import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Dog, Cat, Bird, Heart, PawPrint } from 'lucide-react'
import { api } from '../api'
import { EmptyState } from '../components/EmptyState'

function typeIcon(type) {
  const t = (type || '').toLowerCase()
  if (t === 'cat') return Cat
  if (t === 'bird') return Bird
  return Dog
}

function PetAvatar({ pet }) {
  const colors = {
    dog: 'from-sky-400 to-blue-500',
    cat: 'from-amber-400 to-orange-500',
    bird: 'from-emerald-400 to-teal-500',
  }
  const Icon = typeIcon(pet.type)
  const bg = colors[(pet.type || 'dog').toLowerCase()] || colors.dog
  
  return (
    <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-8 h-8 text-white" strokeWidth={1.75} />
      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="w-3 h-3 text-white fill-white" />
      </div>
    </div>
  )
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-800 dark:text-white tracking-tight flex items-center gap-3">
            <PawPrint className="w-8 h-8 text-primary-500" />
            Your Pets
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl">
            Profiles, medical history, and schedules in one place.
          </p>
        </div>
        <Link
          to="/pets/new"
          className="btn-gradient-primary inline-flex items-center justify-center gap-2"
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
              className="h-40 rounded-3xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border border-slate-100 animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
            />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="glass-card border-dashed p-8">
          <EmptyState 
            type="pets"
            action={
              <Link
                to="/pets/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all hover:scale-105 shadow-lg shadow-sky-500/25"
              >
                <Plus className="w-5 h-5" />
                Add your first pet
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet, index) => (
            <Link
              key={pet._id}
              to={`/pets/${pet._id}`}
              className="group glass-card p-6 hover:shadow-xl dark:hover:shadow-dark-soft hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PetAvatar pet={pet} />
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-lg text-charcoal-800 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {pet.name}
                </p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 capitalize flex items-center gap-1 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cream-100 dark:bg-charcoal-700 text-xs font-medium">
                    {pet.type}
                  </span>
                  <span className="text-charcoal-300 dark:text-charcoal-600">•</span>
                  {pet.age} yrs
                  <span className="text-charcoal-300 dark:text-charcoal-600">•</span>
                  {pet.weight} kg
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-charcoal-300 dark:text-charcoal-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
