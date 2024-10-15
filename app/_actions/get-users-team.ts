"use server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getPlanByPrice } from "@/services/stripe/stripe"
import { getServerSession } from "next-auth"

export async function GetUsersTeam(selectedTeamId: string) {

  const session = await getServerSession(authOptions)

  if(!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  const user = await db.user.findUnique({
    where: {email: session.user.email}
  })

  if(!user) {
    throw new Error("Usuário não encontrado")
  }

  const userPlan = getPlanByPrice(user.stripePriceId as string)

  const team = await db.team.findUnique({
    where: {id: selectedTeamId},
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  })

  if(!team) {
    throw new Error("Equipe não encontrada")
  }

  const membersCount = team.members.length
  const membersLimit = userPlan.quota.members

  return {team, membersCount, membersLimit}

}