import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext.jsx'
import { api } from '../api.js'

export function Logout() {
  const { logoutLocal } = useAuth()
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await api.logout()
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        logoutLocal()
        setDone(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [logoutLocal])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-100 text-emerald-700 mx-auto">
          <LogOut className="w-7 h-7" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">
            {done ? 'Signed out' : 'Signing out…'}
          </h1>
          <p className="mt-2 text-slate-600">
            {done
              ? 'Thanks for using PawCare. See you soon.'
              : 'Securely ending your session.'}
          </p>
        </div>
        {done && (
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600"
          >
            Sign in again
          </Link>
        )}
      </div>
    </div>
  )
}
