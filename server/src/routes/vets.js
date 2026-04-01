import { Router } from 'express'
import { Vet } from '../models/Vet.js'

export const vetRoutes = Router()

vetRoutes.get('/emergency', async (_req, res, next) => {
  try {
    const list = await Vet.find({ emergency: true }).sort({ distanceKm: 1 }).lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})

vetRoutes.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const filter = q
      ? {
          $or: [
            { name: new RegExp(q, 'i') },
            { address: new RegExp(q, 'i') },
          ],
        }
      : {}
    const list = await Vet.find(filter).sort({ rating: -1 }).lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})
