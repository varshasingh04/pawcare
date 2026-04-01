import { Router } from 'express'
import { Reminder } from '../models/Reminder.js'
import { authenticate } from '../middleware/auth.js'

export const reminderRoutes = Router()
reminderRoutes.use(authenticate)

reminderRoutes.get('/', async (req, res, next) => {
  try {
    const list = await Reminder.find({ owner: req.userId, status: 'upcoming' })
      .sort({ urgent: -1, createdAt: 1 })
      .lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})
