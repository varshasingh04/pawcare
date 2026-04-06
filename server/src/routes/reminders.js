import { Router } from 'express'
import { Reminder } from '../models/Reminder.js'
import { Pet } from '../models/Pet.js'
import { authenticate } from '../middleware/auth.js'

export const reminderRoutes = Router()
reminderRoutes.use(authenticate)

function formatDueLabel(dueDate) {
  if (!dueDate) return ''
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  if (diffDays <= 30) return `Due in ${Math.ceil(diffDays / 7)} week(s)`
  return `Due in ${Math.ceil(diffDays / 30)} month(s)`
}

reminderRoutes.get('/', async (req, res, next) => {
  try {
    const { status = 'upcoming' } = req.query
    const query = { owner: req.userId }
    if (status !== 'all') query.status = status

    const list = await Reminder.find(query)
      .sort({ urgent: -1, dueDate: 1, createdAt: 1 })
      .lean()

    const withLabels = list.map((r) => ({
      ...r,
      dueLabel: r.dueLabel || formatDueLabel(r.dueDate),
    }))

    res.json(withLabels)
  } catch (e) {
    next(e)
  }
})

reminderRoutes.post('/', async (req, res, next) => {
  try {
    const { title, petId, kind, dueDate, notes, urgent } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }

    let petName = ''
    if (petId) {
      const pet = await Pet.findOne({ _id: petId, owner: req.userId })
      if (pet) petName = pet.name
    }

    const reminder = await Reminder.create({
      owner: req.userId,
      pet: petId || null,
      title,
      petName,
      kind: kind || 'custom',
      dueDate: dueDate ? new Date(dueDate) : null,
      dueLabel: formatDueLabel(dueDate ? new Date(dueDate) : null),
      notes: notes || '',
      urgent: urgent || false,
      status: 'upcoming',
    })

    res.status(201).json(reminder)
  } catch (e) {
    next(e)
  }
})

reminderRoutes.put('/:id', async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.userId })
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    const { title, petId, kind, dueDate, notes, urgent, status } = req.body

    if (title !== undefined) reminder.title = title
    if (kind !== undefined) reminder.kind = kind
    if (dueDate !== undefined) {
      reminder.dueDate = dueDate ? new Date(dueDate) : null
      reminder.dueLabel = formatDueLabel(dueDate ? new Date(dueDate) : null)
    }
    if (notes !== undefined) reminder.notes = notes
    if (urgent !== undefined) reminder.urgent = urgent
    if (status !== undefined) reminder.status = status

    if (petId !== undefined) {
      if (petId) {
        const pet = await Pet.findOne({ _id: petId, owner: req.userId })
        if (pet) {
          reminder.pet = pet._id
          reminder.petName = pet.name
        }
      } else {
        reminder.pet = null
        reminder.petName = ''
      }
    }

    await reminder.save()
    res.json(reminder)
  } catch (e) {
    next(e)
  }
})

reminderRoutes.put('/:id/complete', async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.userId })
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' })
    }

    reminder.status = 'completed'
    await reminder.save()
    res.json(reminder)
  } catch (e) {
    next(e)
  }
})

reminderRoutes.delete('/:id', async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, owner: req.userId })
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' })
    }
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
