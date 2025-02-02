"use server"

import { db } from "@/lib/db"

export async function getApiKeyByTeamAndProvider(teamId: string, provider: string) {
    try {
        const apiKey = await db.apiKey.findFirst({
            where: {
                teamId,
                provider,
            }
        })
        return apiKey
    } catch (error) {
        return null
    }
}