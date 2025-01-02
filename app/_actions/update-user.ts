"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function UpdateUser(userId: string, newUsername: string) {

        const user = await getServerSession(authOptions)
    
        if(!user) {
            throw new Error("Usuário não autenticado")
        }

    await db.user.update({
        where: {
            id: userId
        },
        data: {
            name: newUsername
        }
    })
}