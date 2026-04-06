import { Routes, Route } from 'react-router-dom'
import { ProtectedAppLayout } from './components/ProtectedAppLayout'
import { Dashboard } from './pages/Dashboard'
import { PetProfile } from './pages/PetProfile'
import { AddPet } from './pages/AddPet'
import { VetFinder } from './pages/VetFinder'
import { BookAppointment } from './pages/BookAppointment'
import { Reminders } from './pages/Reminders'
import { Emergency } from './pages/Emergency'
import { UserProfile } from './pages/UserProfile'
import { PetsHub } from './pages/PetsHub'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Logout } from './pages/Logout'
import { PetScan } from './pages/PetScan'
import { PetHelpMap } from './pages/PetHelpMap'
import { AddVaccination } from './pages/AddVaccination'
import { LostPoster } from './pages/LostPoster'
import { SymptomChecker } from './pages/SymptomChecker'
import { NutritionAdvisor } from './pages/NutritionAdvisor'

export default function App() {
  return (
    <Routes>
      <Route path="/pet/scan/:shareToken" element={<PetScan />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route element={<ProtectedAppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="pets" element={<PetsHub />} />
        <Route path="pets/new" element={<AddPet />} />
        <Route path="pets/:id" element={<PetProfile />} />
        <Route path="pets/:petId/vaccinations/new" element={<AddVaccination />} />
        <Route path="pets/:petId/lost-poster" element={<LostPoster />} />
        <Route path="vets" element={<VetFinder />} />
        <Route path="help-map" element={<PetHelpMap />} />
        <Route path="appointments/book" element={<BookAppointment />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="symptom-checker" element={<SymptomChecker />} />
        <Route path="nutrition-advisor" element={<NutritionAdvisor />} />
      </Route>
    </Routes>
  )
}
