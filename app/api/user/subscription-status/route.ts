// app/api/user/subscription-status/route.ts
import { GetUser } from "@/app/_actions/get-user"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const userData = await GetUser()
    return NextResponse.json({
      isActive: userData?.stripeSubscriptionStatus === 'active'
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao verificar assinatura" },
      { status: 500 }
    )
  }
}