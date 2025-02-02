"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CircleCheckBig } from "lucide-react"

export default function SuccessPage() {
  const { update } = useSession()
  const router = useRouter()

  useEffect(() => {
    const refreshSession = async () => {
      await update() // Atualiza a sessão
      router.push("/dashboard") // Redireciona para o dashboard
    }

    refreshSession()
  }, [update, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-4">
          <CircleCheckBig className="text-green-500" size={18} />
          Pagamento bem-sucedido!
        </h1>
        <p>Seu pedido foi confirmado! Agradecemos a confiança!</p>
        <p className="text-sm text-neutral-500">
          Redirecionando para o dashboard...
        </p>
      </div>
    </div>
  )
}
