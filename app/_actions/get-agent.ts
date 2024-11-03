"use server";

import { db } from "@/lib/db";

// Função para buscar agente pelo ID
export async function getAgentById(id: string) {
  return await db.agent.findUnique({
    where: { id },
  });
}

// Função para atualizar um agente pelo ID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAgent(id: string, data: any) {
  return await db.agent.update({
    where: { id },
    data,
  });
}
