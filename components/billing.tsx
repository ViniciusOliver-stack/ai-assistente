"use client"

import { getPlanByPrice } from "@/services/stripe/stripe"
import { useSession } from "next-auth/react"

export async function Billing() {
  const { data: session } = useSession()
  const plan = await getPlanByPrice(
    session?.user?.stripeSubscriptionId as string
  )

  return (
    <>
      <h1>Uso do plano</h1>

      <p>Você está atualmente no {plan.name}. Ciclo de faturamento atual:</p>
    </>
  )
}
