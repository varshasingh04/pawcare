import { Router } from 'express'
import { LostPetReport } from '../models/LostPetReport.js'
import { Pet } from '../models/Pet.js'
import { authenticate } from '../middleware/auth.js'

export const lostPetRoutes = Router()

lostPetRoutes.get('/:petId', async (req, res, next) => {
  try {
    const report = await LostPetReport.findOne({ pet: req.params.petId })
      .populate('pet', 'name type breed photoEmoji shareToken')
      .lean()

    if (!report) {
      return res.status(404).json({ message: 'No lost report found' })
    }

    res.json(report)
  } catch (e) {
    next(e)
  }
})

lostPetRoutes.post('/:petId', authenticate, async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const {
      lastSeenLocation,
      lastSeenDate,
      description,
      wearing,
      behaviorNotes,
      reward,
      contactPhone,
      contactWhatsApp,
      contactEmail,
    } = req.body

    if (!lastSeenLocation?.address) {
      return res.status(400).json({ message: 'Last seen location address is required' })
    }
    
    if (lastSeenLocation.lat === undefined) lastSeenLocation.lat = 0
    if (lastSeenLocation.lng === undefined) lastSeenLocation.lng = 0

    if (!lastSeenDate) {
      return res.status(400).json({ message: 'Last seen date is required' })
    }

    const existing = await LostPetReport.findOne({ pet: pet._id })
    
    if (existing) {
      existing.status = 'lost'
      existing.lastSeenLocation = lastSeenLocation
      existing.lastSeenDate = new Date(lastSeenDate)
      existing.description = description || ''
      existing.wearing = wearing || ''
      existing.behaviorNotes = behaviorNotes || ''
      existing.reward = reward || ''
      existing.contactPhone = contactPhone || ''
      existing.contactWhatsApp = contactWhatsApp || ''
      existing.contactEmail = contactEmail || ''
      existing.resolvedAt = null
      existing.resolvedNotes = ''
      await existing.save()
      return res.status(200).json(existing)
    }

    const report = await LostPetReport.create({
      pet: pet._id,
      owner: req.userId,
      status: 'lost',
      lastSeenLocation,
      lastSeenDate: new Date(lastSeenDate),
      description: description || '',
      wearing: wearing || '',
      behaviorNotes: behaviorNotes || '',
      reward: reward || '',
      contactPhone: contactPhone || '',
      contactWhatsApp: contactWhatsApp || '',
      contactEmail: contactEmail || '',
    })

    res.status(201).json(report)
  } catch (e) {
    next(e)
  }
})

lostPetRoutes.put('/:petId', authenticate, async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const report = await LostPetReport.findOne({ pet: pet._id })
    if (!report) {
      return res.status(404).json({ message: 'No lost report found' })
    }

    const {
      lastSeenLocation,
      lastSeenDate,
      description,
      wearing,
      behaviorNotes,
      reward,
      contactPhone,
      contactWhatsApp,
      contactEmail,
    } = req.body

    if (lastSeenLocation) report.lastSeenLocation = lastSeenLocation
    if (lastSeenDate) report.lastSeenDate = new Date(lastSeenDate)
    if (description !== undefined) report.description = description
    if (wearing !== undefined) report.wearing = wearing
    if (behaviorNotes !== undefined) report.behaviorNotes = behaviorNotes
    if (reward !== undefined) report.reward = reward
    if (contactPhone !== undefined) report.contactPhone = contactPhone
    if (contactWhatsApp !== undefined) report.contactWhatsApp = contactWhatsApp
    if (contactEmail !== undefined) report.contactEmail = contactEmail

    await report.save()
    res.json(report)
  } catch (e) {
    next(e)
  }
})

lostPetRoutes.post('/:petId/found', authenticate, async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const report = await LostPetReport.findOne({ pet: pet._id, status: 'lost' })
    if (!report) {
      return res.status(404).json({ message: 'No active lost report found' })
    }

    const { notes } = req.body

    report.status = 'reunited'
    report.resolvedAt = new Date()
    report.resolvedNotes = notes || 'Pet has been found!'

    await report.save()
    res.json(report)
  } catch (e) {
    next(e)
  }
})

lostPetRoutes.post('/:petId/sighting', async (req, res, next) => {
  try {
    const report = await LostPetReport.findOne({ pet: req.params.petId, status: 'lost' })
    if (!report) {
      return res.status(404).json({ message: 'No active lost report found for this pet' })
    }

    const { location, notes, reportedBy, contactInfo } = req.body

    if (!location?.lat || !location?.lng) {
      return res.status(400).json({ message: 'Location is required' })
    }

    report.sightings.push({
      location,
      notes: notes || '',
      reportedBy: reportedBy || 'Anonymous',
      contactInfo: contactInfo || '',
    })

    await report.save()
    res.status(201).json({ message: 'Sighting reported. Thank you!' })
  } catch (e) {
    next(e)
  }
})

lostPetRoutes.delete('/:petId', authenticate, async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    await LostPetReport.findOneAndDelete({ pet: pet._id })
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
