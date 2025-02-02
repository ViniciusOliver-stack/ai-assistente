"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function CountTeamUser() {
    const session = await getServerSession(authOptions)

    if(!session?.user) {
        return
    }

    const count = await db.team.count({
        where: {
            ownerId: session.user.id
        }
    })

    return count
}