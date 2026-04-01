import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { authenticate, signToken } from '../middleware/auth.js'

const noopLogout = (_req, res) => res.status(204).send()

export const authRoutes = Router()

authRoutes.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password, and name are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      phone: typeof phone === 'string' ? phone.trim() : '',
    })
    const token = signToken(user._id.toString())
    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, phone: user.phone || null },
    })
  } catch (e) {
    next(e)
  }
})

authRoutes.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    let ok = false
    try {
      ok = await bcrypt.compare(password, user.passwordHash)
    } catch {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const token = signToken(user._id.toString())
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, phone: user.phone || null },
    })
  } catch (e) {
    next(e)
  }
})

/** Stateless JWT — client removes token. No body; optional call before clearing storage. */
authRoutes.post('/logout', noopLogout)

authRoutes.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('email name phone').lean()
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone && String(user.phone).trim() ? user.phone.trim() : null,
    })
  } catch (e) {
    next(e)
  }
})
