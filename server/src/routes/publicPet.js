import { Router } from 'express'
import { Pet } from '../models/Pet.js'
import { LostPetReport } from '../models/LostPetReport.js'

export const publicPetRoutes = Router()

/**
 * Public: scan QR → pet summary + owner contact (no auth).
 * Does not expose medical history, internal ids, or weight.
 * If pet is lost, shows LOST status with emergency contact info.
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

    const lostReport = await LostPetReport.findOne({ pet: pet._id, status: 'lost' }).lean()

    const o = pet.owner
    const response = {
      pet: {
        id: pet._id,
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
      isLost: !!lostReport,
      lostInfo: lostReport
        ? {
            lastSeenLocation: lostReport.lastSeenLocation,
            lastSeenDate: lostReport.lastSeenDate,
            description: lostReport.description,
            wearing: lostReport.wearing,
            behaviorNotes: lostReport.behaviorNotes,
            reward: lostReport.reward,
            contactPhone: lostReport.contactPhone || o.phone || null,
            contactWhatsApp: lostReport.contactWhatsApp || null,
            contactEmail: lostReport.contactEmail || o.email || null,
          }
        : null,
    }

    res.json(response)
  } catch (e) {
    next(e)
  }
})
