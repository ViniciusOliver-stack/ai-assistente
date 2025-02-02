// app/api/user/[userId]/setup-status/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: { setupCompleted: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ setupCompleted: user.setupCompleted })
  } catch (error) {
    console.error("Erro ao verificar setup:", error)
    return NextResponse.json(
      { error: "Erro ao verificar status de configuração" },
      { status: 500 }
    )
  }
}