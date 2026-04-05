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
  getPets: () => request('/pets'),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (body) => request('/pets', { method: 'POST', body: JSON.stringify(body) }),
  getReminders: () => request('/reminders'),
  getVets: (q) => request(`/vets${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getEmergencyVets: () => request('/vets/emergency'),
  createAppointment: (body) =>
    request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  /** Public — no login. Returns pet summary + owner contact for QR scan. */
  getPublicPetByShareToken: (shareToken) =>
    request(`/public/pet/${encodeURIComponent(shareToken)}`),
}
