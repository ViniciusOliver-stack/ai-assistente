// app/agents/new/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"
import useTeamStore from "@/store/team-store"

import Alert from "@/components/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createAgent } from "@/app/_actions/agents"
import { useTrialStore } from "@/store/use-trial-store"

export default function NewAgents() {
  const router = useRouter()
  const { toast } = useToast()
  const { selectedTeamId } = useTeamStore()
  const [isLoading, setIsLoading] = useState(false)
  const [hasActiveSub, setHasActiveSub] = useState(true)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [agentCount, setAgentCount] = useState(0)
  const { isTrialExpired } = useTrialStore()

  useEffect(() => {
    const checkAgentLimit = async () => {
      if (selectedTeamId) {
        const response = await fetch(
          `/api/agents/count?teamId=${selectedTeamId}`
        )
        const { count } = await response.json()
        setAgentCount(count)
      }
    }

    checkAgentLimit()
  }, [selectedTeamId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTeamId) {
      toast({
        title: "Erro ao criar agente",
        description: "Selecione uma equipe primeiro",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createAgent({
        ...formData,
        teamId: selectedTeamId,
      })

      if (result.success) {
        toast({
          title: "Agente criado com sucesso!",
          description: "Seu agente foi criado e está pronto para uso.",
        })
        router.push("/agents")
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar agente",
        description: error.message || "Ocorreu um erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/user/subscription-status")
        const data = await res.json()
        setHasActiveSub(data.isActive)
      } catch (error) {
        console.error("Error checking access:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])

  // Não mostra a navegação se o trial não foi iniciado ou expirou
  if (!hasActiveSub && isTrialExpired) {
    router.push("/dashboard")
  }

  if (!selectedTeamId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">
          Selecione uma equipe para criar um novo agente.
        </p>
        <Link
          href="/config/team"
          className="hover:text-blue-500 flex items-center gap-1 text-muted-foreground underline"
        >
          Desejo criar minha equipe
          <ArrowUpRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <section>
      <header className="space-y-6 mb-6">
        <Link
          href="/agents"
          className="flex items-center gap-1 text-sm hover:text-blue-500 transition-all duration-200"
        >
          <ArrowLeftIcon size={18} />
          Voltar
        </Link>
        <Alert
          title="Essas informações não afetam a respostas do seu Agente"
          color="info"
        />
      </header>

      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col w-full max-w-lg gap-1.5">
            <Label htmlFor="agentTitle">Nome</Label>
            <Input
              id="agentTitle"
              type="text"
              required
              placeholder="Escreva o nome do agente"
              className="py-6"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col w-full max-w-lg gap-1.5">
            <Label htmlFor="agentDescription">Descrição</Label>
            <Textarea
              id="agentDescription"
              placeholder="Escreva o que seu agente faz"
              required
              className="resize-none h-40"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="w-32"
              disabled={isLoading || agentCount >= 1}
            >
              {isLoading ? "Criando..." : "Criar Agente"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/agents")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
