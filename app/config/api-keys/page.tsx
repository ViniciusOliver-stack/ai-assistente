"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import useTeamStore from "@/store/team-store"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ApiKey {
  id: string
  key: string
  provider: string
  teamId: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const [editableKeys, setEditableKeys] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({})

  const selectedTeamId = useTeamStore((state) => state.selectedTeamId)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedTeamId) {
      fetchApiKeys()
    }
  }, [selectedTeamId])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`/api/keys?teamId=${selectedTeamId}`)
      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setApiKeys(data)
        // Initialize editable states
        const initialEditableKeys: Record<string, string> = {}
        data.forEach((key: ApiKey) => {
          initialEditableKeys[key.provider] = ""
        })
        setEditableKeys(initialEditableKeys)
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
      toast({
        title: "Erro ao carregar as chaves",
        description: "Não foi possível carregar as chaves de API.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) {
      return "*".repeat(key.length) // Mascara toda a string se for muito curta
    }
    return `${key.substring(0, 4)}${"*".repeat(
      Math.max(0, key.length - 8)
    )}${key.substring(key.length - 4)}`
  }

  console.log(apiKeys)
  console.log("Editable Keys:", editableKeys)

  const handleSaveApiKey = async (provider: string, apiKey: string) => {
    if (!selectedTeamId) {
      toast({
        title: "Selecione a equipe primeiro",
        description:
          "Você precisa selecionar uma equipe antes de salvar a API Key.",
        variant: "destructive",
      })
      return
    }

    if (apiKey.length < 10) {
      // ou outro tamanho mínimo apropriado
      toast({
        title: "Chave API inválida",
        description: "A chave API deve ter pelo menos 10 caracteres.",
        variant: "destructive",
      })
      return
    }

    setIsSaving({ ...isSaving, [provider]: true })

    try {
      const existingKey = apiKeys.find((key) => key.provider === provider)
      console.log("Existing Key:", existingKey)
      const method = existingKey ? "PUT" : "POST"
      const url = existingKey ? `/api/keys/${existingKey.id}` : "/api/keys"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTeamId,
          provider,
          apiKey,
        }),
      })

      if (response.ok) {
        await fetchApiKeys()
        setIsEditing({ ...isEditing, [provider]: false })
        setEditableKeys({ ...editableKeys, [provider]: "" })
        toast({
          title: "API Key salva com sucesso",
          description: `A API Key do ${provider} foi ${
            existingKey ? "atualizada" : "salva"
          } com sucesso.`,
        })
      }
    } catch (error) {
      console.error(`Erro ao salvar a API Key do ${provider}:`, error)
      toast({
        title: "Erro ao salvar",
        description: `Não foi possível salvar a API Key do ${provider}.`,
        variant: "destructive",
      })
    } finally {
      setIsSaving({ ...isSaving, [provider]: false })
    }
  }

  const renderApiKeySection = (provider: string, logoSrc: string) => {
    const existingKey = apiKeys.find((key) => key.provider === provider)
    const isEditingThis = isEditing[provider]
    const isSavingThis = isSaving[provider]

    return (
      <section className="w-full flex flex-col rounded-md border border-gray-300">
        <header className="p-4 flex items-center justify-between gap-2 bg-zinc-300 rounded-t-md">
          <Image
            src={logoSrc}
            width={1000}
            height={1000}
            alt={`logo ${provider}`}
            className="w-auto h-6"
          />
        </header>

        <div className="w-full px-3 flex items-center justify-between gap-2 rounded-lg py-3 border-none">
          {existingKey && !isEditingThis ? (
            <>
              <Input
                type="text"
                value={maskApiKey(existingKey.key)}
                disabled
                className="focus:outline-none flex-1"
              />
              <Button
                onClick={() => setIsEditing({ ...isEditing, [provider]: true })}
                className="dark:text-neutral-900 hover:bg-blue-500 hover:dark:text-white"
              >
                Editar
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder={provider}
                value={editableKeys[provider]}
                onChange={(e) =>
                  setEditableKeys({
                    ...editableKeys,
                    [provider]: e.target.value,
                  })
                }
                className="focus:outline-none flex-1"
              />
              <Button
                onClick={() =>
                  handleSaveApiKey(provider, editableKeys[provider])
                }
                disabled={isSavingThis}
                className="dark:text-neutral-900 hover:bg-blue-500 hover:dark:text-white"
              >
                {isSavingThis ? "Salvando..." : "Salvar"}
              </Button>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <section>
      <Header title="Chaves de API" description="Gerencie suas chaves de API" />

      <section className="">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">API Keys externas</h2>
          <p className="text-sm text-gray-500">
            Configure as API Keys das suas LLMs favoritas.
          </p>
        </header>

        <div className="flex flex-col gap-5 mt-8">
          {isLoading ? (
            <div>Carregando...</div>
          ) : (
            <>
              {renderApiKeySection("OpenAI", "/OpenAI_light.svg")}
              {renderApiKeySection("GroqAI", "/Groq_light.svg")}
            </>
          )}
        </div>
      </section>
    </section>
  )
}
