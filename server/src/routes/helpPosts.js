import { Router } from 'express'
import { HelpPost } from '../models/HelpPost.js'
import { authenticate } from '../middleware/auth.js'

export const helpPostRoutes = Router()

helpPostRoutes.get('/', async (req, res, next) => {
  try {
    const posts = await HelpPost.find({ status: 'active' })
      .sort({ urgent: -1, createdAt: -1 })
      .populate('owner', 'name')
      .lean()
    res.json(posts)
  } catch (e) {
    next(e)
  }
})

helpPostRoutes.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, category, urgent, location, contactPhone, petType } = req.body

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' })
    }

    if (!location?.lat || !location?.lng || !location?.address) {
      return res.status(400).json({ message: 'Location is required' })
    }

    const post = await HelpPost.create({
      owner: req.userId,
      title,
      description,
      category: category || 'general',
      urgent: urgent || false,
      location,
      contactPhone: contactPhone || '',
      petType: petType || '',
      status: 'active',
    })

    res.status(201).json(post)
  } catch (e) {
    next(e)
  }
})

helpPostRoutes.put('/:id/resolve', authenticate, async (req, res, next) => {
  try {
    const post = await HelpPost.findOne({ _id: req.params.id, owner: req.userId })
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    post.status = 'resolved'
    await post.save()
    res.json(post)
  } catch (e) {
    next(e)
  }
})

helpPostRoutes.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const post = await HelpPost.findOneAndDelete({ _id: req.params.id, owner: req.userId })
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
