"use server"

import { db } from "@/lib/db"

export async function SaveApiKeys(selectedTeamId: string, provider: string, apiKey: string) {
    
    console.log("Selected Team ID:", selectedTeamId);


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