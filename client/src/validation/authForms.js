/** Simple RFC 5322–style email check (practical for forms). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin({ email, password }) {
  const errors = {}
  const e = (email || '').trim()
  if (!e) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(e)) errors.email = 'Enter a valid email address.'
  if (password == null || String(password).trim() === '') errors.password = 'Password is required.'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateRegister({ name, email, password }) {
  const errors = {}
  const n = (name || '').trim()
  if (!n) errors.name = 'Name is required.'
  else if (n.length < 2) errors.name = 'Name must be at least 2 characters.'
  else if (n.length > 80) errors.name = 'Name must be 80 characters or fewer.'

  const em = (email || '').trim()
  if (!em) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(em)) errors.email = 'Enter a valid email address.'
  else if (em.length > 254) errors.email = 'Email is too long.'

  const p = password || ''
  if (!p) errors.password = 'Password is required.'
  else if (p.length < 6) errors.password = 'Password must be at least 6 characters.'
  else if (p.length > 128) errors.password = 'Password must be 128 characters or fewer.'

  return { valid: Object.keys(errors).length === 0, errors }
}
