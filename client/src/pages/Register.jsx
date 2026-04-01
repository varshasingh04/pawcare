import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { useAuth } from '../AuthContext.jsx'
import { validateRegister } from '../validation/authForms.js'

function inputClass(invalid) {
  return [
    'w-full rounded-2xl border bg-slate-50/50 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 transition-shadow',
    invalid
      ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
      : 'border-slate-200 focus:ring-sky-400 focus:border-transparent',
  ].join(' ')
}

export function Register() {
  const { user, register, loading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({ name: false, email: false, password: false })
  const [submitting, setSubmitting] = useState(false)

  if (!authLoading && user) {
    return <Navigate to="/" replace />
  }

  function runValidate(n = name, em = email, pw = password) {
    return validateRegister({ name: n, email: em, password: pw })
  }

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }))
    const { errors } = runValidate()
    if (errors[field]) setFieldErrors((f) => ({ ...f, [field]: errors[field] }))
  }

  function clearFieldError(key) {
    setFieldErrors((f) => {
      const next = { ...f }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setTouched({ name: true, email: true, password: true })
    const { valid, errors } = runValidate()
    setFieldErrors(errors)
    if (!valid) return

    setSubmitting(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
    } catch (err) {
      setError(err.message || 'Could not create account.')
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
          <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Create account</h1>
          <p className="mt-2 text-slate-600">Join PawCare to track your pets&apos; health in one place.</p>
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
            <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-2">
              Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                const v = e.target.value
                setName(v)
                clearFieldError('name')
                if (touched.name) {
                  const { errors } = validateRegister({ name: v, email, password })
                  if (errors.name) setFieldErrors((f) => ({ ...f, name: errors.name }))
                }
              }}
              onBlur={() => handleBlur('name')}
              className={inputClass(!!fieldErrors.name)}
              placeholder="Your name"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
            />
            {fieldErrors.name && (
              <p id="reg-name-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                const v = e.target.value
                setEmail(v)
                clearFieldError('email')
                if (touched.email) {
                  const { errors } = validateRegister({ name, email: v, password })
                  if (errors.email) setFieldErrors((f) => ({ ...f, email: errors.email }))
                }
              }}
              onBlur={() => handleBlur('email')}
              className={inputClass(!!fieldErrors.email)}
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="reg-email-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const v = e.target.value
                setPassword(v)
                clearFieldError('password')
                if (touched.password) {
                  const { errors } = validateRegister({ name, email, password: v })
                  if (errors.password) setFieldErrors((f) => ({ ...f, password: errors.password }))
                }
              }}
              onBlur={() => handleBlur('password')}
              className={inputClass(!!fieldErrors.password)}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? 'reg-password-hint reg-password-error' : 'reg-password-hint'
              }
            />
            <p id="reg-password-hint" className="mt-1 text-xs text-slate-500">
              At least 6 characters, max 128.
            </p>
            {fieldErrors.password && (
              <p id="reg-password-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Creating…' : 'Sign up'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
