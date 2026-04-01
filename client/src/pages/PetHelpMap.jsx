import { MapBasedPetHelp } from '../components/MapBasedPetHelp.jsx'

export function PetHelpMap() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Map-Based Pet Help & Services</h1>
        <p className="text-sm md:text-base text-slate-600 mt-2">
          Find nearby vets, grooming, and community help posts. Uses your location (when available) to center the map.
        </p>
      </div>

      <MapBasedPetHelp />
    </div>
  )
}

