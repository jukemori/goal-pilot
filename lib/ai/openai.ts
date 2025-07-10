import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const AI_MODELS = {
  roadmap: 'gpt-3.5-turbo', // Using cheaper model for overview
  stages: 'gpt-4o-mini', // Using more capable model for detailed stages
  tasks: 'gpt-3.5-turbo',
} as const