import { Router } from 'express'
import { Pet } from '../models/Pet.js'
import { authenticate } from '../middleware/auth.js'
import { createUniqueShareToken } from '../lib/shareToken.js'

export const petRoutes = Router()
petRoutes.use(authenticate)

petRoutes.get('/', async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.userId }).sort({ updatedAt: -1 }).lean()
    res.json(pets)
  } catch (e) {
    next(e)
  }
})

petRoutes.get('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId }).lean()
    if (!pet) return res.status(404).json({ message: 'Pet not found' })
    res.json(pet)
  } catch (e) {
    next(e)
  }
})

petRoutes.post('/', async (req, res, next) => {
  try {
    const { name, type, age, weight, breed } = req.body
    if (!name || type == null || age == null || weight == null) {
      return res.status(400).json({ message: 'name, type, age, and weight are required' })
    }
    const shareToken = await createUniqueShareToken()
    const pet = await Pet.create({
      owner: req.userId,
      shareToken,
      name,
      type,
      age: Number(age),
      weight: Number(weight),
      breed,
      photoEmoji: type?.toLowerCase() === 'cat' ? '🐱' : '🐕',
      medicalHistory: [
        { date: 'Jan 2025', title: 'Wellness exam', detail: 'Healthy weight, teeth cleaning scheduled.' },
      ],
      schedules: [
        { type: 'vaccine', label: 'Rabies booster', when: 'Due in 6 months' },
        { type: 'medicine', label: 'Flea & tick', when: 'Monthly — next dose in 2 weeks' },
      ],
    })
    res.status(201).json(pet)
  } catch (e) {
    next(e)
  }
})
