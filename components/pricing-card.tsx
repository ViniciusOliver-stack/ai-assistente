import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { SUBSCRIPTION_PLANS } from "@/config/plans"
import { Card } from "./ui/card"
import { SubscriptionPlan } from "@/types/stripe"
import { useSession } from "next-auth/react"
import { Switch } from "./ui/switch"
import { Check } from "lucide-react"
import { GetUser } from "@/app/_actions/get-user"

export function PricingCard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [userStripeId, setUserStripeId] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  useEffect(() => {
    const handleGetUserStripeId = async () => {
      const responseUserStripeId = await GetUser()

      setUserStripeId(responseUserStripeId?.stripePriceId!)
    }

    handleGetUserStripeId()
  }, [])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!session?.user) {
      // Redirecionar para login
      return
    }

    setLoading(plan.priceId)

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error(error)
      setLoading(null)
    }
  }

  const currentPlan = SUBSCRIPTION_PLANS.find(
    (plan) => plan.interval === (isAnnual ? "year" : "month")
  )

  return (
    <div className="flex flex-col items-center max-w-6xl mx-auto px-4">
      {/* Billing Toggle */}
      <div className="flex items-center gap-4 mb-8">
        <span className={`text-sm ${!isAnnual ? "font-semibold" : ""}`}>
          Mensal
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-blue-600"
        />
        <span className={`text-sm ${isAnnual ? "font-semibold" : ""}`}>
          Anual
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 w-full">
        {/* Placeholder Card */}
        <Card className="p-6 opacity-70">
          <div className="flex flex-col h-full items-center justify-center text-center">
            <h3 className="text-2xl font-bold mb-2">Gerencial</h3>
            <p className="text-xl font-semibold text-gray-500">Em breve</p>
          </div>
        </Card>

        {/* Active Plan Card */}
        {currentPlan && (
          <Card className="p-6 border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
              Mais popular
            </div>
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-bold">{currentPlan.name}</h3>
              <p className="mt-2 text-gray-500 text-sm">
                {currentPlan.description}
              </p>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  R$ {currentPlan.price.toFixed(2)}
                </span>
                <span className="text-gray-500">
                  /{currentPlan.interval === "month" ? "mês" : "ano"}
                </span>
              </div>
              <div className="mt-6 space-y-2">
                <p className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  {currentPlan.limits.agents} Agentes IA
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  {currentPlan.limits.teams} Equipes
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Interação ilimitada no WhatsApp
                </p>
                <p className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Integração com WhatsApp via QR Code
                </p>
              </div>
              <Button
                className="mt-6 bg-blue-500 hover:bg-blue-600 hover:disabled:cursor-not-allowed"
                onClick={() => handleSubscribe(currentPlan)}
                disabled={
                  !!loading || !session || userStripeId === currentPlan.priceId
                }
              >
                {loading === currentPlan.priceId
                  ? "Processando..."
                  : userStripeId === currentPlan.priceId
                  ? "Plano Atual"
                  : "Escolher Plano"}
              </Button>
            </div>
          </Card>
        )}

        {/* Placeholder Card */}
        <Card className="p-6 opacity-70">
          <div className="flex flex-col h-full items-center justify-center text-center">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <p className="text-xl font-semibold text-gray-500">Em breve</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
