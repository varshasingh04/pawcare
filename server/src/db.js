import mongoose from 'mongoose'
import { seedIfEmpty } from './seed.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/petcare'

let connectPromise = null
let seeded = false

export async function ensureDatabaseConnected() {
  if (mongoose.connection.readyState === 1) {
    if (!seeded) {
      await seedIfEmpty()
      seeded = true
    }
    return
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(MONGODB_URI)
  }

  await connectPromise

  if (!seeded) {
    await seedIfEmpty()
    seeded = true
  }
}

