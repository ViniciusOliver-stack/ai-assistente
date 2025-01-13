"use server"

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function getListModelsWithApiKey(teamId: string) {
    const user = await getServerSession(authOptions)

    if (!user) {
        throw new Error("Usuário não autenticado para obter os agentes!");
    }

    const listModelsWithApiKey = await db.apiKey.findMany({
        where: {
            teamId: teamId,
        },
        select: {
            provider: true
        }
    })

    if(!listModelsWithApiKey) {
        return []
    }

    return listModelsWithApiKey
}