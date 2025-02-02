// app/api/user/setup-complete/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário ausente" }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { setupCompleted: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao finalizar setup:", error)
    return NextResponse.json(
      { error: "Erro ao finalizar configuração inicial" },
      { status: 500 }
    )
  }
}