import { getAgentById, updateAgent } from "@/app/_actions/get-agent"
import Alert from "@/components/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

export type Agent = {
  id: string
  title: string | null
  description: string | null
  enterprise: string | null
  providerModel: string | null
  temperature: number | null
  restrictionContent: boolean | null
  languageDetector: boolean | null
  prompt: string | null
  teamId: string
  tokenId: string | null
}

interface PanelAgentsProps {
  id: string
}

export function PanelAgents({ id }: PanelAgentsProps) {
  const { toast } = useToast()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Partial<Agent>>({})

  // Buscar agente pelo ID
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        if (id) {
          const fetchedAgent = await getAgentById(id as string)
          setAgent(fetchedAgent)
          //   setFormData(fetchedAgent)
        }
      } catch (error) {
        console.error("Erro ao buscar agente:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAgent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (id) {
        await updateAgent(id as string, formData)
        toast({
          title: "Sucesso!",
          description: "Agente atualizado com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar agente:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o agente.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) return <Spinner />

  if (!agent) return <div>Agente não encontrado.</div>

  return (
    <div className="w-full flex flex-col gap-10">
      <Alert title="Essas informações não afetam a respostas do seu Agente" />

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
        <div>
          <Label>Nome do agente</Label>
          <Input
            className="w-[500px]"
            type="text"
            value={formData.title || ""}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            className="resize-none w-[500px]"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <Button className="hover:bg-blue-500 w-fit">Salvar Alterações</Button>
      </form>
    </div>
  )
}
