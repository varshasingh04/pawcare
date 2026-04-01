import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { AppLayout } from './AppLayout.jsx'

export function ProtectedAppLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-10 w-10 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
        <p className="text-sm font-medium">Loading your space…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
