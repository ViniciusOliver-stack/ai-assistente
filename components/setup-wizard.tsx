"use client"

import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Loader2, Rocket } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

type Step = "profile" | "team" | "agent" | "api-keys"

export function SetupWizard() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("profile")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  //Dados do formulário
  const [username, setUsername] = useState(session?.user.name || "")
  const [teamName, setTeamName] = useState("")
  const [descriptionTeam, setDescriptionTeam] = useState("")
  const [agentName, setAgentName] = useState("")
  const [descriptionAgent, setDescriptionAgent] = useState("")
  const [apiKey, setApiKey] = useState("")

  // Verificar se o setup já foi concluído ao montar o componente
  useEffect(() => {
    const checkSetupStatus = async () => {
      if (session?.user?.id) {
        const res = await fetch(`/api/user/${session.user.id}/setup-status`)
        const data = await res.json()

        if (data.setupCompleted) {
          router.refresh()
          window.location.reload()
        }
      }
    }

    checkSetupStatus()
  }, [session?.user?.id])

  const handleSubmit = async () => {
    setLoading(true)

    try {
      switch (currentStep) {
        case "profile":
          await handleProfileSubmit()
          break
        case "team":
          await handleTeamSubmit()
          break
        case "agent":
          await handleAgentSubmit()
          break
        case "api-keys":
          await handleApiKeysSubmit()
          break
      }

      //Avança para o próximo passo ou finalizar
      const stepsOrder: Step[] = ["profile", "team", "agent", "api-keys"]
      const currentIndex = stepsOrder.indexOf(currentStep)
      if (currentIndex < stepsOrder.length - 1) {
        setCurrentStep(stepsOrder[currentIndex + 1])
      } else {
        await finalizeSetup()
      }
    } catch (error: any) {
      toast({
        title: "Ocorreu um erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async () => {
    if (!username.trim()) throw new Error("Digite seu nome completo")

    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session?.user.id,
        newUsername: username,
      }),
    })

    if (!res.ok) throw new Error("Falha ao atualizar perfil")
    await update() // Atualizar sessão
  }

  const handleTeamSubmit = async () => {
    if (!teamName.trim()) throw new Error("Digite o nome da sua equipe")
    if (teamName.length > 30)
      throw new Error("Nome muito longo (máx. 30 caracteres)")

    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: teamName.trim(),
        description: descriptionTeam.trim(),
      }),
    })

    if (!res.ok) throw new Error("Falha ao criar equipe")
  }

  const handleAgentSubmit = async () => {
    if (!agentName.trim()) throw new Error("Digite o nome do agente")

    const res = await fetch("/api/agents/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: agentName,
        descriptionAgent: descriptionAgent,
      }),
    })

    if (!res.ok) throw new Error("Falha ao criar agente")
  }

  const handleApiKeysSubmit = async () => {
    if (!apiKey.trim()) throw new Error("Digite uma chave de API válida")

    const res = await fetch("/api/api-keys/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: apiKey,
        ownerId: session?.user.id,
      }),
    })

    if (!res.ok) throw new Error("Falha ao registrar chave de API")
  }

  const finalizeSetup = async () => {
    const res = await fetch("/api/user/setup-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user.id }),
    })

    if (!res.ok) throw new Error("Falha ao finalizar setup")

    router.refresh()
    toast({
      title: "Tudo pronto! 🎉",
      description: "Configuração inicial concluída com sucesso!",
    })
    // Força a atualização da página e recarrega os dados
    router.refresh()
    window.location.reload()
  }

  const getStepContent = () => {
    switch (currentStep) {
      case "profile":
        return (
          <div className="space-y-4 relative">
            <div className="text-center">
              <Rocket className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Vamos começar sua jornada!</h2>
              <p className="text-muted-foreground">
                Primeiro, como devemos te chamar?
              </p>
            </div>
            <div className="space-y-2">
              <Label>Seu nome completo</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>
          </div>
        )
      case "team":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Crie sua primeira equipe 👥</h2>
            <p className="text-muted-foreground">
              Como você quer nomear sua equipe?
            </p>
            <div className="space-y-2">
              <Label>Nome da equipe</Label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex: Equipe de Vendas"
              />
              <Textarea
                value={descriptionTeam}
                onChange={(e) => setDescriptionTeam(e.target.value)}
                placeholder="Descreva sua equipe"
              />
            </div>
          </div>
        )
      case "agent":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Crie seu primeiro agente 🤖</h2>
            <p className="text-muted-foreground">
              Dê um nome para seu assistente virtual
            </p>
            <div className="space-y-2">
              <Label>Nome do agente</Label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Ex: Suporte Técnico"
              />
              <Textarea
                value={descriptionAgent}
                onChange={(e) => setDescriptionAgent(e.target.value)}
                placeholder="Descreva seu agente"
              />
            </div>
          </div>
        )
      case "api-keys":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Configure suas chaves de API 🔑
            </h2>
            <p className="text-muted-foreground">
              Insira sua chave de API do provedor
            </p>
            <div className="space-y-2">
              <Label>Chave de API</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ex: sk-...1234"
              />
            </div>
          </div>
        )
    }
  }
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border rounded-xl p-6 max-w-md w-full shadow-lg space-y-6">
        {getStepContent()}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : currentStep === "api-keys" ? (
            "Finalizar Setup 🎉"
          ) : (
            "Continuar ➡️"
          )}
        </Button>
      </div>
    </div>
  )
}
