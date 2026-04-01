import crypto from 'crypto'
import { Pet } from '../models/Pet.js'

export async function createUniqueShareToken() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const token = crypto.randomBytes(18).toString('base64url')
    const taken = await Pet.exists({ shareToken: token })
    if (!taken) return token
  }
  throw new Error('Unable to generate unique share token')
}
