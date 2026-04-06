import { Router } from 'express'
import { Pet } from '../models/Pet.js'
import { VaccinationRecord } from '../models/VaccinationRecord.js'
import { Reminder } from '../models/Reminder.js'
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

function getPhotoEmoji(petType) {
  const t = (petType || '').toLowerCase()
  if (t === 'cat') return '🐱'
  if (t === 'bird') return '🐦'
  return '🐕'
}

function getDefaultSchedules(petType) {
  const t = (petType || '').toLowerCase()
  if (t === 'bird') {
    return [
      { type: 'vaccine', label: 'Annual wellness exam', when: 'Due in 6 months' },
      { type: 'medicine', label: 'Beak/nail trim', when: 'Every 2-3 months' },
    ]
  }
  if (t === 'cat') {
    return [
      { type: 'vaccine', label: 'Rabies vaccine', when: 'Due yearly' },
      { type: 'vaccine', label: 'FVRCP vaccine', when: 'Due yearly' },
      { type: 'medicine', label: 'Flea prevention', when: 'Monthly' },
    ]
  }
  return [
    { type: 'vaccine', label: 'Rabies booster', when: 'Due in 6 months' },
    { type: 'vaccine', label: 'DHPP vaccine', when: 'Due yearly' },
    { type: 'medicine', label: 'Heartworm prevention', when: 'Monthly' },
    { type: 'medicine', label: 'Flea & tick', when: 'Monthly' },
  ]
}

petRoutes.post('/', async (req, res, next) => {
  try {
    const { name, type, age, weight, breed, gender, reproductiveStatus, lastHeatDate } = req.body
    if (!name || type == null || age == null || weight == null) {
      return res.status(400).json({ message: 'name, type, age, and weight are required' })
    }
    const shareToken = await createUniqueShareToken()

    const heatCycles = []
    if (lastHeatDate && gender === 'female' && reproductiveStatus === 'intact') {
      heatCycles.push({ startDate: new Date(lastHeatDate) })
    }

    const pet = await Pet.create({
      owner: req.userId,
      shareToken,
      name,
      type,
      age: Number(age),
      weight: Number(weight),
      breed,
      gender: gender || 'unknown',
      reproductiveStatus: reproductiveStatus || 'unknown',
      heatCycles,
      photoEmoji: getPhotoEmoji(type),
      medicalHistory: [
        { date: 'Jan 2025', title: 'Wellness exam', detail: 'Healthy weight, teeth cleaning scheduled.' },
      ],
      schedules: getDefaultSchedules(type),
    })
    res.status(201).json(pet)
  } catch (e) {
    next(e)
  }
})

petRoutes.put('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const { name, type, age, weight, breed, gender, reproductiveStatus } = req.body

    if (name) pet.name = name
    if (type) {
      pet.type = type
      pet.photoEmoji = getPhotoEmoji(type)
      pet.schedules = getDefaultSchedules(type)
    }
    if (age != null) pet.age = Number(age)
    if (weight != null) pet.weight = Number(weight)
    if (breed !== undefined) pet.breed = breed
    if (gender) pet.gender = gender
    if (reproductiveStatus) pet.reproductiveStatus = reproductiveStatus

    await pet.save()
    res.json(pet)
  } catch (e) {
    next(e)
  }
})

petRoutes.delete('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const vaccinations = await VaccinationRecord.find({ pet: pet._id })
    const reminderIds = vaccinations.map((v) => v.reminder).filter(Boolean)
    
    await VaccinationRecord.deleteMany({ pet: pet._id })
    if (reminderIds.length > 0) {
      await Reminder.deleteMany({ _id: { $in: reminderIds } })
    }
    
    await pet.deleteOne()
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

petRoutes.put('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const { name, type, age, weight, breed, gender, reproductiveStatus } = req.body

    if (name) pet.name = name
    if (type) {
      pet.type = type
      pet.photoEmoji = getPhotoEmoji(type)
      pet.schedules = getDefaultSchedules(type)
    }
    if (age != null) pet.age = Number(age)
    if (weight != null) pet.weight = Number(weight)
    if (breed !== undefined) pet.breed = breed
    if (gender) pet.gender = gender
    if (reproductiveStatus) pet.reproductiveStatus = reproductiveStatus

    await pet.save()
    res.json(pet)
  } catch (e) {
    next(e)
  }
})

petRoutes.delete('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.id, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

petRoutes.post('/:id/heat-cycle', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    if (pet.gender !== 'female' || pet.reproductiveStatus !== 'intact') {
      return res.status(400).json({ message: 'Heat cycle tracking is only for intact female pets' })
    }

    const { startDate, endDate, notes } = req.body
    if (!startDate) {
      return res.status(400).json({ message: 'startDate is required' })
    }

    pet.heatCycles.push({
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes: notes || '',
    })

    await pet.save()
    res.status(201).json(pet)
  } catch (e) {
    next(e)
  }
})
