"use server"

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function getTeams() {
    const user = await getServerSession(authOptions)

    if(!user) {
        throw new Error("Usuário não autenticado")
    }

    return await db.team.findMany({
        where: {
            members: {
                some: {
                    userId: user.user.id
                }
            }
        },
        include: {
            agents: {
                include: {
                    WhatsAppInstance: true
                }
            }
        }
    })
}