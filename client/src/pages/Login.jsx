import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { useAuth } from '../AuthContext.jsx'
import { validateLogin } from '../validation/authForms.js'

function inputClass(invalid) {
  return [
    'w-full rounded-2xl border bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 transition-shadow',
    invalid
      ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
      : 'border-slate-200 focus:ring-sky-400 focus:border-transparent',
  ].join(' ')
}

export function Login() {
  const { user, login, loading: authLoading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)

  if (!authLoading && user) {
    return <Navigate to={from} replace />
  }

  function runValidate(nextEmail = email, nextPassword = password) {
    return validateLogin({ email: nextEmail, password: nextPassword })
  }

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }))
    const { errors } = runValidate()
    if (field === 'email' && errors.email) setFieldErrors((f) => ({ ...f, email: errors.email }))
    if (field === 'password' && errors.password) setFieldErrors((f) => ({ ...f, password: errors.password }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setTouched({ email: true, password: true })
    const { valid, errors } = runValidate()
    setFieldErrors(errors)
    if (!valid) return

    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-lg shadow-sky-500/30">
              <PawPrint className="w-6 h-6" strokeWidth={2.2} />
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="mt-2 text-slate-600">Sign in to manage pets, vets, and reminders.</p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-slate-100/90 p-8 shadow-card space-y-5"
        >
          {error && (
            <div className="rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-100" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value
                setEmail(v)
                setFieldErrors((f) => {
                  const next = { ...f }
                  delete next.email
                  return next
                })
                if (touched.email) {
                  const { errors } = validateLogin({ email: v, password })
                  if (errors.email) setFieldErrors((f) => ({ ...f, email: errors.email }))
                }
              }}
              onBlur={() => handleBlur('email')}
              className={inputClass(!!fieldErrors.email)}
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="login-email-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                const v = e.target.value
                setPassword(v)
                setFieldErrors((f) => {
                  const next = { ...f }
                  delete next.password
                  return next
                })
                if (touched.password) {
                  const { errors } = validateLogin({ email, password: v })
                  if (errors.password) setFieldErrors((f) => ({ ...f, password: errors.password }))
                }
              }}
              onBlur={() => handleBlur('password')}
              className={inputClass(!!fieldErrors.password)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            />
            {fieldErrors.password && (
              <p id="login-password-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Create an account
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-slate-400">
          Demo: <span className="font-mono text-slate-500">john@example.com</span> /{' '}
          <span className="font-mono text-slate-500">password123</span>
        </p>
      </div>
    </div>
  )
}
