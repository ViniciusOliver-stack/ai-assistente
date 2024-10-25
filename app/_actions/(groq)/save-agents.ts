"use server"

import { db } from "@/lib/db"

// interface SaveAgentParams {
//     model: string;
//     temperature: number;
//     limitToken: number;
//     selectedAI: string;
//     teamId: string;
//   }

// export async function saveAgents({
//     model,
//     temperature,
//     limitToken,
//     selectedAI,
//     teamId,
//   }: SaveAgentParams) {
//     try {
//         const result = await db.agent.create({
//             data: {
//               providerModel: model,
//               temperature,
//               limitToken: limitToken.toString(),
//               enterprise: selectedAI, // Armazenando qual IA foi selecionada
//               teamId,
//             },
//           });

//         return result
//     } catch (error) {
//         console.error("Erro ao salvar o agente:", error);
//         return null
//     }
// }

export async function getAgentById(id: string) {
  return await db.agent.findUnique({
    where: { id },
  })
}

export async function updateAgent(id: string, data: any) {
  try{
    const updatedAgent = await db.agent.update({
      where: { id },
      data,
    })

    return updatedAgent
  }catch(error){
    console.error("Erro ao atualizar agente", error)
    return null
  }
}