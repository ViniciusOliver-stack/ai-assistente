"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FolderDownIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  updatePrompt,
  getPromptById,
  getTemplateByName,
} from "@/app/_actions/prompt"
import { useToast } from "@/hooks/use-toast"
import useTeamStore from "@/store/team-store"

export function ModelsPrompt() {
  const { selectedAgentId } = useTeamStore()
  const { toast } = useToast()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectModelPrompt, setSelectModelPrompt] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [promptData, setPromptData] = useState({
    whoIsAgent: "",
    whatAgentDoes: "",
    agentObjective: "",
    agentResponseStyle: "",
    customRules: "",
  })

  // Carregar o prompt salvo ao montar o componente
  useEffect(() => {
    const fetchPrompt = async () => {
      if (selectedAgentId) {
        const prompt = await getPromptById(selectedAgentId)
        if (prompt) {
          const { prompt: savedPrompt } = prompt
          updatePromptFields(savedPrompt as string)
        }
      }
    }

    fetchPrompt()
  }, [selectedAgentId])

  const updatePromptFields = (promptContent: string) => {
    setPromptData({
      whoIsAgent: extractFromTag(promptContent, "identidade"),
      whatAgentDoes: extractFromTag(promptContent, "funcao"),
      agentObjective: extractFromTag(promptContent, "objetivo"),
      agentResponseStyle: extractFromTag(promptContent, "estilo"),
      customRules: extractFromTag(promptContent, "regras-personalizadas"),
    })
  }

  // const handleSavePrompt = async () => {
  //   const formattedPrompt = formatPrompt(
  //     promptData.whoIsAgent,
  //     promptData.whatAgentDoes,
  //     promptData.agentObjective,
  //     promptData.agentResponseStyle,
  //     promptData.customRules
  //   )

  //   const fetchPrompt = await updatePrompt(agentId as string, {
  //     prompt: formattedPrompt,
  //   })

  //   if (fetchPrompt) {
  //     toast({
  //       title: "Prompt salvo com sucesso!",
  //       description: "Seu prompt foi salvo com sucesso.",
  //     })
  //   } else {
  //     toast({
  //       title: "Erro ao salvar prompt",
  //       description: "Ocorreu um erro ao salvar o prompt.",
  //       variant: "destructive",
  //     })
  //   }
  // }

  // Função para extrair conteúdo baseado na tag
  const extractFromTag = (content: string, tag: string): string => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, "i")
    const match = content.match(regex)
    return match ? match[1].trim() : ""
  }

  // Função para definir o modelo ao clicar no botão
  const handleModelSelect = async (model: string) => {
    try {
      setSelectModelPrompt(model)
      const template = await getTemplateByName(model)

      if (template?.prompt) {
        const updatedPrompt = await updatePrompt(selectedAgentId as string, {
          prompt: template.prompt,
        })

        if (updatedPrompt) {
          // Atualiza os campos do formulário com o novo template
          updatePromptFields(template.prompt)

          toast({
            title: "Template importado com sucesso!",
            description: "Seu template foi importado com sucesso.",
          })

          // Fecha o modal
          setIsDialogOpen(false)
        }
      }
    } catch (error) {
      console.log("Erro ao importar template:", error)
      toast({
        title: "Erro ao importar template",
        description: "Ocorreu um erro ao importar o template.",
        variant: "destructive",
      })
    }
  }

  const handleSavePrompt = async () => {
    const formattedPrompt = formatPrompt(
      promptData.whoIsAgent,
      promptData.whatAgentDoes,
      promptData.agentObjective,
      promptData.agentResponseStyle,
      promptData.customRules
    )

    const fetchPrompt = await updatePrompt(selectedAgentId as string, {
      prompt: formattedPrompt,
    })

    if (fetchPrompt) {
      toast({
        title: "Prompt salvo com sucesso!",
        description: "Seu prompt foi salvo com sucesso.",
      })
    } else {
      toast({
        title: "Erro ao salvar prompt",
        description: "Ocorreu um erro ao salvar o prompt.",
        variant: "destructive",
      })
    }
  }

  if (!selectedAgentId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Selecione um agente para configurar o prompt
        </p>
      </div>
    )
  }

  return (
    <section className="h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium bg-zinc-300 dark:bg-zinc-800 px-2 py-1 rounded-md">
          Simplificado
        </h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="flex items-center gap-1.5 hover:text-blue-500 transition-all duration-200">
            <FolderDownIcon size={18} /> Importar templates
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecionar template</DialogTitle>
              <DialogDescription>
                Utilize templates desenvolvidos pela nossa equipe.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              {[
                "Agents AI",
                "Suporte ao cliente",
                "Recuperar venda",
                "RH",
                "Marketing",
                "SDR",
                "Closer",
                "Sucesso do cliente",
              ].map((model) => (
                <Button
                  key={model}
                  className="w-fit dark:text-neutral-900 hover:bg-blue-500 hover:dark:text-white transition-all duration-200 ease-in-out"
                  onClick={() => handleModelSelect(model)}
                >
                  {model}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h3 className="text-xl my-4">Informações essenciais</h3>

        <form className="flex flex-col gap-8">
          <div>
            <Label htmlFor="howAgents">Quem é o seu agente?</Label>
            <Textarea
              className="min-h-36"
              id="howAgents"
              placeholder="Você é um especialista em atendimento ao suporte..."
              value={promptData.whoIsAgent}
              onChange={(e) =>
                setPromptData({ ...promptData, whoIsAgent: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="howMakeAgents">O que seu agente faz?</Label>
            <Textarea
              className="min-h-36"
              id="howMakeAgents"
              placeholder="Sua missão principal é resolver problemas..."
              value={promptData.whatAgentDoes}
              onChange={(e) =>
                setPromptData({ ...promptData, whatAgentDoes: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="objectiveAgents">
              Qual o objetivo do seu agente?
            </Label>
            <Textarea
              className="min-h-36"
              id="objectiveAgents"
              placeholder="Seu objetivo é elevar continuamente o nível de satisfação do cliente..."
              value={promptData.agentObjective}
              onChange={(e) =>
                setPromptData({
                  ...promptData,
                  agentObjective: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="howResponseAgents">
              Como seu agente deve responder?
            </Label>
            <Textarea
              className="min-h-36"
              id="howResponseAgents"
              placeholder="Seu estilo de comunicação deve ser..."
              value={promptData.agentResponseStyle}
              onChange={(e) =>
                setPromptData({
                  ...promptData,
                  agentResponseStyle: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="personalizedRulesAgents">
              Regras personalizadas
            </Label>
            <Textarea
              className="min-h-36"
              id="personalizedRulesAgents"
              placeholder="Sempre verifique se..."
              value={promptData.customRules}
              onChange={(e) =>
                setPromptData({ ...promptData, customRules: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleSavePrompt}
            type="button"
            className="dark:text-neutral-900 hover:bg-blue-500 hover:dark:text-white transition-all duration-200 ease-in-out"
          >
            Salvar
          </Button>
        </form>
      </div>
    </section>
  )
}

function wrapWithTag(content: string, tag: string): string {
  const openingTag = `<${tag}>`
  const closingTag = `</${tag}>`

  if (
    content.trim().startsWith(openingTag) &&
    content.trim().endsWith(closingTag)
  ) {
    return content
  }

  return `${openingTag}\n${content.trim()}\n${closingTag}`
}

function formatPrompt(
  whoIsAgent: string,
  whatAgentDoes: string,
  agentObjective: string,
  agentResponseStyle: string,
  customRules: string
) {
  const formattedWhoIsAgent = wrapWithTag(whoIsAgent, "identidade")
  const formattedWhatAgentDoes = wrapWithTag(whatAgentDoes, "funcao")
  const formattedAgentObjective = wrapWithTag(agentObjective, "objetivo")
  const formattedAgentResponseStyle = wrapWithTag(agentResponseStyle, "estilo")
  const formattedCustomRules = wrapWithTag(customRules, "regras-personalizadas")

  return `
    ${formattedWhoIsAgent}
    ${formattedWhatAgentDoes}
    ${formattedAgentObjective}
    ${formattedAgentResponseStyle}
    ${formattedCustomRules}
  `
}
