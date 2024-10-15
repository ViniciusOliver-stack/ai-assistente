"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GetUserRole(teamId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  return await db.teamMember.findUnique({
    where: {
        userId_teamId: {
            userId: session.user.id,
            teamId,
        },
    },
    select: {
      role: true,
    },
  })
}
