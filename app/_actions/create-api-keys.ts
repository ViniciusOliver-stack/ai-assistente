"use server"

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db"
import { getServerSession } from "next-auth";

export async function SaveApiKeys(selectedTeamId: string, provider: string, apiKey: string) {

    const user = await getServerSession(authOptions)
    
    if(!user) {
        throw new Error("Usuário não autenticado")
    }
    
    try {
        const newApiKey = await db.apiKey.create({
            data: {
                key: apiKey,
                provider: provider,
                team: {
                    connect: {
                        id: selectedTeamId
                    }
                }
            }
        })

        return newApiKey
    } catch (error) {
        console.error('Erro ao salvar a chave de API: ', error)
        throw new Error("Não foi possível salvar a chave de API")
    }

}