import { Router } from 'express'
import { Pet } from '../models/Pet.js'

export const publicPetRoutes = Router()

/**
 * Public: scan QR → pet summary + owner contact (no auth).
 * Does not expose medical history, internal ids, or weight.
 */
publicPetRoutes.get('/:shareToken', async (req, res, next) => {
  try {
    const raw = (req.params.shareToken || '').trim()
    if (!raw || raw.length > 200) {
      return res.status(404).json({ message: 'Pet tag not found' })
    }
    const pet = await Pet.findOne({ shareToken: raw })
      .populate('owner', 'name email phone')
      .lean()

    if (!pet || !pet.owner) {
      return res.status(404).json({ message: 'Pet tag not found' })
    }

    const o = pet.owner
    res.json({
      pet: {
        name: pet.name,
        type: pet.type,
        breed: pet.breed || null,
        age: pet.age,
        photoEmoji: pet.photoEmoji || '🐾',
      },
      owner: {
        name: o.name,
        email: o.email || null,
        phone: o.phone && String(o.phone).trim() ? o.phone.trim() : null,
      },
    })
  } catch (e) {
    next(e)
  }
})
