import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

let genAI = null
let model = null

function getModel() {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
  }
  return model
}

export async function analyzeSymptoms(petType, petAge, symptoms, additionalInfo) {
  const model = getModel()

  const prompt = `You are a veterinary health assistant AI. A pet owner is concerned about their pet and needs guidance.

Pet Information:
- Type: ${petType}
- Age: ${petAge} years old
- Symptoms: ${symptoms.join(', ')}
${additionalInfo ? `- Additional details: ${additionalInfo}` : ''}

Based on these symptoms, provide:
1. **Possible Conditions** (list 2-3 most likely conditions with brief explanations)
2. **Severity Level** (one of: "Monitor at home", "See vet soon", "Urgent - see vet today", "Emergency - go to vet immediately")
3. **Immediate Care Tips** (what the owner can do right now)
4. **Warning Signs** (symptoms that would require immediate vet visit)

IMPORTANT: Always remind the owner that this is AI guidance, not a diagnosis, and they should consult a veterinarian for proper medical advice.

Respond in a clear, caring tone. Format with markdown.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function getNutritionAdvice(petType, breed, age, weight, activityLevel, healthConditions) {
  const model = getModel()

  const prompt = `You are a pet nutrition expert AI. Provide personalized diet and nutrition advice for this pet.

Pet Profile:
- Type: ${petType}
- Breed: ${breed || 'Mixed/Unknown'}
- Age: ${age} years old
- Weight: ${weight} kg
- Activity Level: ${activityLevel || 'Moderate'}
${healthConditions ? `- Health Conditions: ${healthConditions}` : ''}

Provide comprehensive nutrition advice including:
1. **Daily Calorie Needs** (estimated range based on weight and activity)
2. **Recommended Diet Type** (dry food, wet food, raw, combination, etc.)
3. **Feeding Schedule** (how many meals per day and when)
4. **Portion Size** (cups or grams per meal)
5. **Key Nutrients** (what to look for in their food)
6. **Foods to Avoid** (toxic or harmful foods for this pet type)
7. **Treats** (healthy treat options and how much is okay)
8. **Hydration** (water intake recommendations)
${healthConditions ? '9. **Special Dietary Considerations** (based on health conditions)' : ''}

IMPORTANT: Mention that specific dietary needs may vary and consulting a vet for personalized advice is recommended, especially for pets with health conditions.

Respond in a helpful, easy-to-understand tone. Format with markdown.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}
