import { Router } from 'express'
import { Appointment } from '../models/Appointment.js'
import { authenticate } from '../middleware/auth.js'

export const appointmentRoutes = Router()
appointmentRoutes.use(authenticate)

appointmentRoutes.post('/', async (req, res, next) => {
  try {
    const { date, time, vetName } = req.body
    if (!date || !time) {
      return res.status(400).json({ message: 'date and time required' })
    }
    const doc = await Appointment.create({
      owner: req.userId,
      date: new Date(date),
      time,
      vetName,
    })
    res.status(201).json(doc)
  } catch (e) {
    next(e)
  }
})
