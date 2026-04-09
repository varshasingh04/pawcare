import Groq from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY

let groq = null

function getClient() {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Please add it to your .env file.')
  }
  if (!groq) {
    groq = new Groq({ apiKey })
  }
  return groq
}

const MODELS = [
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
]

async function tryCompletion(client, messages, maxTokens) {
  let lastError = null
  
  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}`)
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      })
      console.log(`Model ${model} succeeded`)
      return completion.choices[0]?.message?.content
    } catch (err) {
      console.error(`Model ${model} failed:`, err.message || err)
      lastError = err
      
      if (err.message?.includes('rate_limit') || err.status === 429) {
        console.log('Rate limit hit, trying next model...')
        continue
      }
    }
  }
  
  const errorMsg = lastError?.message || 'All AI models failed'
  console.error('All models failed. Last error:', errorMsg)
  throw new Error(errorMsg)
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

  const result = await tryCompletion(
    client,
    [{ role: 'user', content: prompt }],
    400
  )

  return result || 'Unable to analyze symptoms.'
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

  const result = await tryCompletion(
    client,
    [{ role: 'user', content: prompt }],
    350
  )

  return result || 'Unable to provide nutrition advice.'
}
