import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production'

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const id = payload.sub
    if (!id) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    req.userId = id
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
