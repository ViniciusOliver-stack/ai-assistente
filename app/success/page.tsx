"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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
        <h1 className="text-2xl font-bold mb-4">Pagamento bem-sucedido!</h1>
        <p>Redirecionando para o dashboard...</p>
      </div>
    </div>
  )
}
