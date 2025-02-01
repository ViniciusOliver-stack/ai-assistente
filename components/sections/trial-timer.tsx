import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRightIcon, Timer } from "lucide-react"
import Link from "next/link"
import { useTrialStore } from "@/store/use-trial-store"
import { useSidebar } from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { GetUser } from "@/app/_actions/get-user"

function TrialTimer() {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const { trialEndDate } = useTrialStore()
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  )

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const userData = await GetUser()
        setSubscriptionStatus(userData?.stripeSubscriptionStatus || null)
      } catch (error) {
        console.error("Erro ao buscar status da assinatura:", error)
      }
    }

    fetchSubscription()
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!trialEndDate) return ""

      const now = new Date()
      const end = new Date(trialEndDate)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        return "Expirado"
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )

      if (days > 0) {
        return `${days}d ${hours}h`
      }
      return `${hours}h`
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [trialEndDate])

  const handleExpand = () => {
    if (isCollapsed) {
      setOpen(true)
    }
  }

  // Não mostrar se:
  // 1. Não tem trial ativo OU
  // 2. Assinatura está ativa
  if (!trialEndDate || subscriptionStatus === "active") return null

  return (
    <Card
      className={`
        transition-all duration-200 ease-linear
        ${
          isCollapsed
            ? "mx-0 p-2 group-data-[collapsible=icon]:w-8"
            : "mx-2 p-4"
        }
        bg-blue-50 dark:bg-blue-900/20 
        border-blue-200 dark:border-blue-800
      `}
      onClick={handleExpand}
    >
      <div className={`space-y-3 ${isCollapsed ? "hidden" : "block"}`}>
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Timer size={16} />
          <span className="text-sm font-medium">Período de teste</span>
        </div>
        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
          {timeLeft}
        </div>
        <Link href="/config/billing">
          <Button
            variant="link"
            className="p-0 h-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            Assinar plano <ArrowUpRightIcon size={16} />
          </Button>
        </Link>
      </div>

      {/* Versão collapsed */}
      <div className={`${isCollapsed ? "block" : "hidden"}`}>
        <Timer size={16} className="text-blue-700 dark:text-blue-300" />
      </div>
    </Card>
  )
}

export default TrialTimer
