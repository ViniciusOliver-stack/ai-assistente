"use client"

import TrialCard from "@/components/trial-card"
import Title from "@/components/ui/title"
import { useTrialStore } from "@/store/use-trial-store"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { GetUser } from "../_actions/get-user"
import { CardTrialBilling } from "@/components/trial-billing-card"
import { SkeletonLoader } from "@/components/animations/skeleton-loader"

interface PageState {
  isLoading: boolean
  hasActiveSub: boolean
  showTrial: boolean
}

export default function App() {
  const { data: session, update } = useSession()
  const { syncWithServer, isTrialStarted, isTrialExpired } = useTrialStore()

  // Unified state object
  const [pageState, setPageState] = useState<PageState>({
    isLoading: true, // Start with loading state
    hasActiveSub: false,
    showTrial: false,
  })

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const userData = await GetUser()
        setPageState((prev) => ({
          ...prev,
          hasActiveSub: userData?.stripeSubscriptionStatus === "active",
          isLoading: false, // Set loading to false after we get the data
        }))
      } catch (error) {
        console.error("Error checking subscription:", error)
        setPageState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    checkSubscription()
  }, [])

  useEffect(() => {
    if (session?.user) {
      // Sincroniza o estado local com o servidor
      syncWithServer(session.user)

      setPageState((prev) => ({
        ...prev,
        showTrial:
          !session.user.planId && !prev.hasActiveSub && !isTrialStarted,
      }))
    }
  }, [session, syncWithServer, isTrialStarted, isTrialExpired])

  const handleStartTrial = async () => {
    try {
      await useTrialStore.getState().startTrial()
      await update() // Atualiza a sessão
      setPageState((prev) => ({ ...prev, showTrial: false }))
    } catch (error) {
      console.error("Erro ao iniciar trial:", error)
    }
  }

  const handleCloseTrial = () => {
    setPageState((prev) => ({ ...prev, showTrial: false }))
  }

  // Show loading state or skeleton
  if (pageState.isLoading) {
    return (
      <div>
        <Title
          title="Dashboard"
          description="Estamos trazendo novas funcionalidades para você em breve!"
        />
        <SkeletonLoader />
      </div>
    )
  }

  if (isTrialExpired && !pageState.hasActiveSub) {
    return <CardTrialBilling />
  }

  return (
    <div>
      <Title
        title="Dashboard"
        description="Estamos trazendo novas funcionalidades para você em breve!"
      />

      <div className="flex flex-1 flex-col gap-4 animate-pulse">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
      </div>

      {pageState.showTrial && (
        <div className="mb-8">
          <TrialCard
            onStartTrial={handleStartTrial}
            onClose={handleCloseTrial}
          />
        </div>
      )}
    </div>
  )
}
