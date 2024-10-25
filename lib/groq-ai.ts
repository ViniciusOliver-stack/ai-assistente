import Groq from "groq-sdk"
import { db } from "./db"

export const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

export const GroqAI = async (content: string, agentId: string) => {

  const agent = await db.agent.findUnique({
    where: {
      id: agentId
    },
    select: {
      prompt: true,
      temperature: true,
      limitToken: true,
      providerModel: true
    }
  })

  if(!agent) {
    throw new Error("Agent não encontrado")
  }

  const enhancedPromptSystem = `
  ${agent.prompt}
  Lembre-se: suas respostas devem ser curtas, diretas e sem detalhes excessivos. Responda de forma objetiva.
  `

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: content
      },
      {
        role: "system",
        content: enhancedPromptSystem || ""
      }
    ],
    model: agent.providerModel || "llama-3.1-70b-versatile", // Use o modelo salvo, ou um default
    temperature: agent.temperature || 0.5, // Use a temperatura salva, ou uma default
    max_tokens: agent.limitToken || 1024, // Use o limite de tokens salvo, ou um default
  });

  return response
}