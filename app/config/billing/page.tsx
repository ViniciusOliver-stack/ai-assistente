"use client"

import { Header } from "@/components/header"
import Plans from "@/components/plans"
import { TextLoader } from "@/components/ui/loading-text"
import { useTrialStore } from "@/store/use-trial-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function BillingPage() {
  const { isTrialExpired } = useTrialStore()
  const [hasActiveSub, setHasActiveSub] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/user/subscription-status")
        const { isActive } = await res.json()
        setHasActiveSub(isActive)
      } catch (error) {
        console.error("Error checking access:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])
  if (loading)
    return (
      <div className="w-full h-auto flex items-center justify-center">
        <TextLoader
          messages={[
            "Carregando pagamentos",
            "Preparando a sua experiência",
            "Quase lá",
          ]}
        />
      </div>
    )

  // Não mostra a navegação se o trial não foi iniciado ou expirou
  if (!hasActiveSub && isTrialExpired) {
    router.push("/dashboard")
  }

  return (
    <section>
      <Header title="Meu plano" description="Gerencie o seu plano" />
      <Plans />
    </section>
  )
}
