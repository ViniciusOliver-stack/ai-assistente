"use server"

import { db } from "@/lib/db"

export async function UpdateUser(userId: string, newUsername: string) {
    await db.user.update({
        where: {
            id: userId
        },
        data: {
            name: newUsername
        }
    })
}