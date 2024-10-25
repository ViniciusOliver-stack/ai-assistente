import getListGroqAi from "@/app/_actions/(groq)/get-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { ModelListResponse } from "groq-sdk/resources/models.mjs"
import { useEffect, useState } from "react"

import { usePathname } from "next/navigation"
import { getAgentById, updateAgent } from "@/app/_actions/get-agent"
import { Spinner } from "@/components/ui/spinner"

interface ModelGroqCloudProps {
  selectedAI: string
}

export function ModelGroqCloud({ selectedAI }: ModelGroqCloudProps) {
  const [temperature, setTemperature] = useState<number>(1.5)
  const [tokenLimit, setTokenLimit] = useState<number>(1024)
  const [models, setModels] = useState<ModelListResponse[]>([])
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const pathname = usePathname()
  const agentId = pathname.split("/").pop()

  useEffect(() => {
    const fetchGroqModels = async () => {
      const listAgents = await getListGroqAi()
      if (listAgents && Array.isArray(listAgents.data)) {
        console.log(listAgents.data)
        setModels(listAgents.data) // Acesse o array na chave 'data'
      } else {
        console.error("Esperado um array na chave 'data': ", listAgents)
      }
    }
    fetchGroqModels()
  }, [])

  useEffect(() => {
    if (agentId) {
      const fetchAgent = async () => {
        try {
          setIsLoading(true)
          const agentData = await getAgentById(agentId as string)
          setSelectedModel(agentData?.providerModel as string)
          setTemperature((agentData?.temperature as number) || 1.5)
          setTokenLimit((agentData?.limitToken as number) || 1024)
        } catch (error) {
          console.error("Erro ao carregar agente:", error)
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

    const result = await updateAgent(agentId as string, {
      providerModel: selectedModel,
      temperature,
      limitToken: tokenLimit,
      enterprise: selectedAI,
    })

    if (result) {
      alert("Agente salvo com sucesso")
    } else {
      alert("Erro ao salvar o agente")
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Select onValueChange={setSelectedModel} value={selectedModel}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.id} {/* Ou outra propriedade, como model.owned_by */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <Label>Temperatura</Label>
          <p className="text-sm"> {temperature}</p>
        </div>
        <Slider
          defaultValue={[temperature]}
          max={2}
          step={0.01}
          onValueChange={(value) => setTemperature(value[0])}
        />
        <p className="text-xs text-gray-500 w-[400px] mt-2">
          A temperatura é um parâmetro que controla a aleatoriedade e
          criatividade das respostas do modelo. Com temperatura 0, as respostas
          são diretas e previsíveis. Com temperatura 2, as respostas variam
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
          max={8192} // Definindo um limite máximo mais razoável
          step={1}
          onValueChange={(value) => setTokenLimit(value[0])}
        />
        <p className="text-xs text-gray-500 w-[400px] mt-2">
          Limite de tokens é um parâmetro que controla a quantidade de palavras
          gerada pela IA para responder determinado assunto, o recomendado é
          manter em 1024.
        </p>
      </div>

      <div>
        <Label htmlFor="stopAi">Parar Sequência</Label>
        <Input type="text" id="stopAi"></Input>
        <p className="text-xs text-gray-500 w-[400px] mt-2">
          Uma sequência de parada é uma sequência de texto predefinida ou
          especificada pelo usuário que sinaliza a uma IA para parar de gerar
          conteúdo, garantindo que suas respostas permaneçam focadas e concisas.
          Exemplos incluem sinais de pontuação e marcadores como
          &quot;[fim]&quot;.
        </p>
      </div>

      <Button onClick={handleSave} className="hover:bg-blue-500 w-fit">
        Salvar Alterações
      </Button>
    </section>
  )
}
