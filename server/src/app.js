import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/auth.js'
import { petRoutes } from './routes/pets.js'
import { reminderRoutes } from './routes/reminders.js'
import { vetRoutes } from './routes/vets.js'
import { appointmentRoutes } from './routes/appointments.js'
import { publicPetRoutes } from './routes/publicPet.js'
import { vaccinationRoutes } from './routes/vaccinations.js'
import { lostPetRoutes } from './routes/lostPets.js'
import { aiRoutes } from './routes/ai.js'
import { helpPostRoutes } from './routes/helpPosts.js'

export const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/public/pet', publicPetRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/vaccinations', vaccinationRoutes)
app.use('/api/lost-pets', lostPetRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/vets', vetRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/help-posts', helpPostRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: err.message || 'Server error' })
})

