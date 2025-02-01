"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function GetUser() {
    const session = await getServerSession(authOptions)

    if(!session?.user) {
        throw new Error("Usuário não autenticado")
    }

    return await db.user.findUnique({
        where: {
            email: session.user.email
        },
        select: {
            stripePriceId: true,
            stripeSubscriptionId: true,
            stripeSubscriptionStatus: true,
            stripeCustomerId: true
        }
    })
}