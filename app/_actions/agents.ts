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

    console.log("Dados recebidos:", data)

    // Verificar se já existe um agente na equipe
    const existingAgents = await db.agent.count({
      where: {
        teamId: data.teamId
      }
    });

    console.log("Número de agentes existentes:", existingAgents);
    
    if (existingAgents >= 1) {
      throw new Error("Você atingiu o limite máximo de agentes por equipe");
    }

    const agent = await db.agent.create({
      data: {
        title: data.title,
        description: data.description,
        team: {
          connect: {
            id: data.teamId
          }
        },
        provider: "OPENAI", // valor padrão
      }
    })
    
    return { success: true, data: agent }
  } catch (error: any) {
    console.error("Erro ao criar agente:", error);
    return { 
      success: false, 
      error: error.message || "Erro ao criar agente" 
    }
  }
}