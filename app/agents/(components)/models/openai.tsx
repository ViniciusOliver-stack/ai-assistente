import { getAgentById, updateAgent } from "@/app/_actions/get-agent"
import { getApiKeyByTeamAndProvider } from "@/app/_actions/get-apikey"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TextLoader } from "@/components/ui/loading-text"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface ModelOpenAIProps {
  selectedAI: string
  teamId: string
}

export function ModelOpenAI({ selectedAI, teamId }: ModelOpenAIProps) {
  const [temperature, setTemperature] = useState<number>(1.5)
  const [tokenLimit, setTokenLimit] = useState<number>(1024)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { toast } = useToast()
  const pathname = usePathname()
  const agentId = pathname.split("/")[2]

  const models = [
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "gpt-3.5", name: "GPT-3.5" },
  ]

  useEffect(() => {
    if (agentId) {
      const fetchAgent = async () => {
        try {
          setIsLoading(true)
          const agentData = await getAgentById(agentId)
          const upperCaseProvider = agentData?.provider.toUpperCase()

          if (upperCaseProvider === "OPENAI") {
            setSelectedModel(agentData?.providerModel || "")
            setTemperature(agentData?.temperature || 1.5)
            setTokenLimit(agentData?.limitToken || 1024)
          }
        } catch (error) {
          console.error("Erro ao carregar o agente", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchAgent()
    }
  }, [agentId])

  const handleSave = async () => {
    if (!selectedModel) {
      toast({
        title: "Ops, selecione um modelo primeiro!",
        description: "Antes de salvar é necessário selecionar um modelo",
        variant: "destructive",
      })
      return
    }

    try {
      const apiKey = await getApiKeyByTeamAndProvider(teamId, "OPENAI")

      if (!apiKey) {
        toast({
          title: "Chave API não encontrada",
          description:
            "É necessário configurar uma chave API para a OpenAI primeiro",
          variant: "destructive",
        })
        return
      }

      const result = await updateAgent(agentId as string, {
        providerModel: selectedModel,
        temperature,
        limitToken: tokenLimit,
        enterprise: selectedAI,
        provider: "OPENAI",
        tokenId: apiKey.id, // Associando a chave API ao agente
      })

      if (result) {
        toast({
          title: "Sucesso!",
          description: "Agente atualizado com sucesso",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      })

      console.error("Erro ao salvar o agente:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-auto flex items-center justify-center">
        <TextLoader
          messages={[
            "Preparando o seu modelo",
            "Preparando a sua experiência",
            "Quase lá",
          ]}
        />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          O modelo GPT 4o oferece respostas mais precisas e segue as instruções
          com mais eficácia.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <Label>Temperatura</Label>
          <p className="text-sm"> {temperature}</p>
        </div>
        <Slider
          defaultValue={[temperature]}
          max={2}
          step={0.1}
          onValueChange={(value) => setTemperature(value[0])}
        />
        <p className="text-xs text-gray-500 mt-2">
          A temperatura é um parâmetro que controla a aleatoriedade e
          criatividade das respostas do modelo. Com temperatura 0, as respostas
          são diretas e previsíveis. Com temperatura 1, as respostas variam
          bastante.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <Label>Limite de Tokens</Label>
          <p className="text-sm">{tokenLimit}</p>
        </div>
        <Slider
          defaultValue={[tokenLimit]}
          max={8192}
          step={1}
          onValueChange={(value) => setTokenLimit(value[0])}
        />
        <p className="text-xs text-gray-500 mt-2">
          Limite de tokens é um parâmetro que controla a quantidade de palavras
          gerada pela IA para responder determinado assunto, o recomendado é
          manter em 1024.
        </p>
      </div>

      <Button className="hover:bg-blue-500 w-fit" onClick={handleSave}>
        Salvar Alterações
      </Button>
    </section>
  )
}
