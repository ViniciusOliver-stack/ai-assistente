"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function CountAgents(teamId: string) {
    const session = await getServerSession(authOptions)

    if(!session?.user) {
        console.log("Usuário não autenticado")
        return
    }

    if(!teamId) {
        console.log("TeamID não foi informado")
        return
    }

    const count = await db.agent.count({
        where: {teamId}
    })

    return count
}