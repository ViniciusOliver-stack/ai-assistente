"use server"

import { db } from "@/lib/db"

export async function getPromptById(id: string) {
    return await db.agent.findUnique({
        where: { id },
    })
}

export async function updatePrompt(id: string, data: any) {
    const prompt = await db.agent.update({
        where: { id },
        data
    })

    return prompt
}