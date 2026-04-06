import { Router } from 'express'
import { VaccinationRecord } from '../models/VaccinationRecord.js'
import { Pet } from '../models/Pet.js'
import { Reminder } from '../models/Reminder.js'
import { authenticate } from '../middleware/auth.js'

export const vaccinationRoutes = Router()
vaccinationRoutes.use(authenticate)

const VACCINE_INTERVALS = {
  rabies: 365,
  dhpp: 365,
  bordetella: 180,
  leptospirosis: 365,
  lyme: 365,
  canine_influenza: 365,
  fvrcp: 365,
  felv: 365,
  deworming: 90,
  flea_tick: 30,
  other: 365,
}

const VACCINE_LABELS = {
  rabies: 'Rabies',
  dhpp: 'DHPP',
  bordetella: 'Bordetella',
  leptospirosis: 'Leptospirosis',
  lyme: 'Lyme',
  canine_influenza: 'Canine Influenza',
  fvrcp: 'FVRCP',
  felv: 'FeLV',
  deworming: 'Deworming',
  flea_tick: 'Flea & Tick',
  other: 'Other',
}

function calculateNextDueDate(dateGiven, vaccineType) {
  const days = VACCINE_INTERVALS[vaccineType] || 365
  const next = new Date(dateGiven)
  next.setDate(next.getDate() + days)
  return next
}

function formatDueLabel(nextDueDate) {
  const now = new Date()
  const diffMs = nextDueDate - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  if (diffDays <= 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`
  if (diffDays <= 90) return `Due in ${Math.ceil(diffDays / 30)} month(s)`
  return `Due in ${Math.ceil(diffDays / 30)} months`
}

vaccinationRoutes.get('/:petId', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const records = await VaccinationRecord.find({ pet: pet._id })
      .sort({ dateGiven: -1 })
      .select('-proofImage')
      .lean()

    const recordsWithLabels = records.map((r) => ({
      ...r,
      vaccineLabel: VACCINE_LABELS[r.vaccineType] || r.vaccineType,
      dueLabel: formatDueLabel(r.nextDueDate),
    }))

    res.json(recordsWithLabels)
  } catch (e) {
    next(e)
  }
})

vaccinationRoutes.get('/:petId/:recordId', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const record = await VaccinationRecord.findOne({
      _id: req.params.recordId,
      pet: pet._id,
    }).lean()

    if (!record) return res.status(404).json({ message: 'Record not found' })

    res.json({
      ...record,
      vaccineLabel: VACCINE_LABELS[record.vaccineType] || record.vaccineType,
      dueLabel: formatDueLabel(record.nextDueDate),
    })
  } catch (e) {
    next(e)
  }
})

vaccinationRoutes.post('/:petId', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const { vaccineType, vaccineName, dateGiven, vetName, proofImage, proofMimeType, notes } = req.body

    if (!vaccineType || !dateGiven || !vetName) {
      return res.status(400).json({ message: 'vaccineType, dateGiven, and vetName are required' })
    }

    if (!proofImage || !proofMimeType) {
      return res.status(400).json({ message: 'Proof image is required for verification' })
    }

    const givenDate = new Date(dateGiven)
    const nextDueDate = calculateNextDueDate(givenDate, vaccineType)

    const vaccineLabel = VACCINE_LABELS[vaccineType] || vaccineName || vaccineType

    const reminder = await Reminder.create({
      owner: req.userId,
      title: `${vaccineLabel} vaccination due`,
      petName: pet.name,
      kind: 'vaccination',
      dueLabel: formatDueLabel(nextDueDate),
      urgent: false,
      status: 'upcoming',
    })

    const record = await VaccinationRecord.create({
      pet: pet._id,
      owner: req.userId,
      vaccineType,
      vaccineName: vaccineName || vaccineLabel,
      dateGiven: givenDate,
      nextDueDate,
      vetName,
      proofImage,
      proofMimeType,
      notes: notes || '',
      reminder: reminder._id,
    })

    res.status(201).json({
      ...record.toObject(),
      vaccineLabel,
      dueLabel: formatDueLabel(nextDueDate),
      proofImage: undefined,
    })
  } catch (e) {
    next(e)
  }
})

vaccinationRoutes.delete('/:petId/:recordId', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.userId })
    if (!pet) return res.status(404).json({ message: 'Pet not found' })

    const record = await VaccinationRecord.findOne({
      _id: req.params.recordId,
      pet: pet._id,
    })

    if (!record) return res.status(404).json({ message: 'Record not found' })

    if (record.reminder) {
      await Reminder.findByIdAndDelete(record.reminder)
    }

    await record.deleteOne()

    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
