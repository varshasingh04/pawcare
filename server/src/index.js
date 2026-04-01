import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { authRoutes } from './routes/auth.js'
import { petRoutes } from './routes/pets.js'
import { reminderRoutes } from './routes/reminders.js'
import { vetRoutes } from './routes/vets.js'
import { appointmentRoutes } from './routes/appointments.js'
import { publicPetRoutes } from './routes/publicPet.js'
import { seedIfEmpty } from './seed.js'

const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/petcare'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/public/pet', publicPetRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/vets', vetRoutes)
app.use('/api/appointments', appointmentRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: err.message || 'Server error' })
})

async function main() {
  await mongoose.connect(MONGODB_URI)
  await seedIfEmpty()
  app.listen(PORT, () => {
    console.log(`API http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
