"use server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

// Função para buscar agente pelo ID
export async function getAgentById(id: string) {
  const user = await getServerSession(authOptions)
  
  if(!user) {
    throw new Error("Usuário não autenticado")
  }

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
