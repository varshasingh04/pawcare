import Groq from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY

let groq = null

function getClient() {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }
  if (!groq) {
    groq = new Groq({ apiKey })
  }
  return groq
}

export async function analyzeSymptoms(petType, petAge, symptoms, additionalInfo) {
  const client = getClient()

  const prompt = `You are a vet assistant. Be concise.

Pet: ${petType}, ${petAge} years old
Symptoms: ${symptoms.join(', ')}
${additionalInfo ? `Note: ${additionalInfo}` : ''}

Provide SHORT response:
1. **Likely Causes** (2-3 bullet points, one line each)
2. **Severity** (Monitor at home / See vet soon / Urgent / Emergency)
3. **Quick Tips** (2-3 bullet points)
4. **See vet if** (1-2 warning signs)

End with: "Consult a vet for proper diagnosis."

Keep total response under 200 words.`

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 400,
  })

  return completion.choices[0]?.message?.content || 'Unable to analyze symptoms.'
}

export async function getNutritionAdvice(petType, breed, age, weight, activityLevel, healthConditions) {
  const client = getClient()

  const prompt = `You are a pet nutrition expert. Be concise.

Pet: ${petType}, ${breed || 'Mixed'}, ${age} years, ${weight} kg, ${activityLevel || 'moderate'} activity
${healthConditions ? `Health: ${healthConditions}` : ''}

Provide SHORT nutrition plan:
1. **Daily Calories** (number range)
2. **Food Type** (dry/wet/mix recommendation)
3. **Schedule** (meals per day)
4. **Portion** (cups or grams per meal)
5. **Avoid** (3-4 toxic foods)
6. **Treats** (limit per day)

End with: "Consult vet for specific dietary needs."

Keep total response under 150 words.`

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 350,
  })

  return completion.choices[0]?.message?.content || 'Unable to provide nutrition advice.'
}
