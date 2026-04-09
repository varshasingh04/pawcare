import { clearToken, getToken } from './authStorage.js'

const runtimeBase = (import.meta.env.VITE_API_BASE_URL || '').trim()
const base = runtimeBase ? `${runtimeBase.replace(/\/+$/, '')}/api` : '/api'

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${base}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) {
      const publicAuth =
        path.startsWith('/auth/login') ||
        path.startsWith('/auth/register') ||
        path === '/auth/me'
      if (!publicAuth) {
        clearToken()
        const p = typeof window !== 'undefined' ? window.location.pathname : ''
        if (p !== '/login' && p !== '/register') {
          window.location.assign('/login')
        }
      }
    }
    throw new Error(err.message || res.statusText)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  exportUserData: () => request('/auth/export-data'),
  getPets: () => request('/pets'),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (body) => request('/pets', { method: 'POST', body: JSON.stringify(body) }),
  updatePet: (id, body) => request(`/pets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),
  logHeatCycle: (petId, body) =>
    request(`/pets/${petId}/heat-cycle`, { method: 'POST', body: JSON.stringify(body) }),
  getVaccinations: (petId) => request(`/vaccinations/${petId}`),
  getVaccination: (petId, recordId) => request(`/vaccinations/${petId}/${recordId}`),
  addVaccination: (petId, body) =>
    request(`/vaccinations/${petId}`, { method: 'POST', body: JSON.stringify(body) }),
  deleteVaccination: (petId, recordId) =>
    request(`/vaccinations/${petId}/${recordId}`, { method: 'DELETE' }),
  getLostReport: (petId) => request(`/lost-pets/${petId}`),
  markPetLost: (petId, body) =>
    request(`/lost-pets/${petId}`, { method: 'POST', body: JSON.stringify(body) }),
  updateLostReport: (petId, body) =>
    request(`/lost-pets/${petId}`, { method: 'PUT', body: JSON.stringify(body) }),
  markPetFound: (petId, notes) =>
    request(`/lost-pets/${petId}/found`, { method: 'POST', body: JSON.stringify({ notes }) }),
  reportSighting: (petId, body) =>
    request(`/lost-pets/${petId}/sighting`, { method: 'POST', body: JSON.stringify(body) }),
  deleteLostReport: (petId) => request(`/lost-pets/${petId}`, { method: 'DELETE' }),
  getReminders: (status) => request(`/reminders${status ? `?status=${status}` : ''}`),
  createReminder: (body) => request('/reminders', { method: 'POST', body: JSON.stringify(body) }),
  updateReminder: (id, body) =>
    request(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  completeReminder: (id) => request(`/reminders/${id}/complete`, { method: 'PUT' }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),
  getVets: (q) => request(`/vets${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getEmergencyVets: () => request('/vets/emergency'),
  createAppointment: (body) =>
    request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  /** Public — no login. Returns pet summary + owner contact for QR scan. */
  getPublicPetByShareToken: (shareToken) =>
    request(`/public/pet/${encodeURIComponent(shareToken)}`),
  checkSymptoms: (body) => request('/ai/symptom-checker', { method: 'POST', body: JSON.stringify(body) }),
  getNutritionAdvice: (body) => request('/ai/nutrition-advisor', { method: 'POST', body: JSON.stringify(body) }),
  getHelpPosts: () => request('/help-posts'),
  createHelpPost: (body) => request('/help-posts', { method: 'POST', body: JSON.stringify(body) }),
  resolveHelpPost: (id) => request(`/help-posts/${id}/resolve`, { method: 'PUT' }),
  deleteHelpPost: (id) => request(`/help-posts/${id}`, { method: 'DELETE' }),
}
