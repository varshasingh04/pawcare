import { Router } from 'express'
import { analyzeSymptoms, getNutritionAdvice } from '../lib/groqAI.js'
import { authenticate } from '../middleware/auth.js'

export const aiRoutes = Router()
aiRoutes.use(authenticate)

aiRoutes.post('/symptom-checker', async (req, res, next) => {
  try {
    const { petType, petAge, symptoms, additionalInfo } = req.body

    if (!petType || !symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'Pet type and at least one symptom are required' })
    }

    const analysis = await analyzeSymptoms(petType, petAge || 'unknown', symptoms, additionalInfo)

    res.json({ analysis })
  } catch (e) {
    console.error('Symptom checker error:', e.message, e.stack)
    if (e.message?.includes('API_KEY') || e.message?.includes('GROQ_API_KEY')) {
      return res.status(500).json({ message: 'AI service is not configured. Please add GROQ_API_KEY to .env file.' })
    }
    return res.status(500).json({ message: e.message || 'AI analysis failed' })
  }
})

aiRoutes.post('/nutrition-advisor', async (req, res, next) => {
  try {
    const { petType, breed, age, weight, activityLevel, healthConditions } = req.body

    if (!petType || !age || !weight) {
      return res.status(400).json({ message: 'Pet type, age, and weight are required' })
    }

    const advice = await getNutritionAdvice(
      petType,
      breed,
      age,
      weight,
      activityLevel,
      healthConditions,
    )

    res.json({ advice })
  } catch (e) {
    console.error('Nutrition advisor error:', e.message, e.stack)
    if (e.message?.includes('API_KEY') || e.message?.includes('GROQ_API_KEY')) {
      return res.status(500).json({ message: 'AI service is not configured. Please add GROQ_API_KEY to .env file.' })
    }
    return res.status(500).json({ message: e.message || 'AI analysis failed' })
  }
})
