// app/_actions/agent.ts
"use server"

import { db } from "@/lib/db"

interface CreateAgentData {
  title: string
  description: string
  teamId: string
}

export async function createAgent(data: CreateAgentData) {
  try {
    const agent = await db.agent.create({
      data: {
        title: data.title,
        description: data.description,
        team: {
          connect: {
            id: data.teamId
          }
        },
        provider: "GROQ", // valor padrão
      }
    })
    
    return { success: true, data: agent }
  } catch (error) {
    console.error("Erro ao criar agente:", error)
    return { success: false, error: "Erro ao criar agente" }
  }
}