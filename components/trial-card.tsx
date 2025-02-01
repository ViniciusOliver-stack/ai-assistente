import React, { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Clock, Sparkles, Check } from "lucide-react"
import { useTrialStore } from "@/store/use-trial-store"
import { useRouter } from "next/navigation"
import { GetUser } from "@/app/_actions/get-user"

interface TrialCardProps {
  onStartTrial?: () => void
  onClose?: () => void
}

const TrialCard = ({ onStartTrial, onClose }: TrialCardProps) => {
  const features = [
    "Acesso completo a todas as funcionalidades",
    "Suporte prioritário 24/7",
    "Integrações ilimitadas",
    "Personalização avançada de agentes",
  ]

  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const { isTrialStarted, isTrialExpired, startTrial } = useTrialStore()
  const [shouldRender, setShouldRender] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSubscriptionAndTrial = async () => {
      try {
        const userData = await GetUser()
        const hasActiveSub = userData?.stripeSubscriptionStatus === "active"
        setHasActiveSubscription(hasActiveSub)

        // Determina se o card deve ser renderizado
        const shouldShowCard =
          !hasActiveSub && (!isTrialStarted || isTrialExpired)

        setShouldRender(shouldShowCard)
      } catch (error) {
        console.error("Erro ao verificar assinatura:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscriptionAndTrial()
  }, [isTrialStarted, isTrialExpired])

  // Não mostra o card se tiver assinatura ativa
  if (hasActiveSubscription) {
    return null
  }

  const handleStartTrial = async () => {
    try {
      await startTrial()
      await onStartTrial?.()
      onClose?.() // Fecha o card após iniciar o trial
      // Força uma atualização da página após iniciar o trial
      router.refresh()
    } catch (error) {
      console.error("Erro ao iniciar o período de teste:", error)
    }
  }

  // Não renderiza nada durante o carregamento ou se não devemos mostrar o card
  if (isLoading || !shouldRender) {
    return null
  }

  // Não mostra o card se o trial já foi iniciado e não expirou
  if (isTrialStarted && !isTrialExpired) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-xl">
        <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-center mb-4">
            <Badge className="bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-2">
              <Clock size={14} />
              Período de teste grátis
            </Badge>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Bem-vindo ao Rubnik
          </h3>
          <p className="text-white/80">
            2 dias de acesso completo sem compromisso
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-6 pt-0">
          <Button
            onClick={handleStartTrial}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 h-11"
          >
            <Sparkles className="h-4 w-4" />
            Começar período de teste
          </Button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Ao clicar em começar, você concorda com nossos termos de serviço
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default TrialCard
