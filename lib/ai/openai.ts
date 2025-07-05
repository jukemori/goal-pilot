import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const AI_MODELS = {
  roadmap: 'gpt-3.5-turbo', // Using cheaper model as requested
  tasks: 'gpt-3.5-turbo',
} as const