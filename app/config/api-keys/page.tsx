"use client"

import { Header } from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import useTeamStore from "@/store/team-store"
import Image from "next/image"
import { useState } from "react"

export default function ApiKeysPage() {
  const [openAiKey, setOpenAiKey] = useState("")
  const [groqAiKey, setGroqAiKey] = useState("")
  const [isSavingOpenAi, setIsSavingOpenAi] = useState(false)
  const [isSavingGroqAi, setIsSavingGroqAi] = useState(false)

  const selectedTemId = useTeamStore((state) => state.selectedTeamId)

  const { toast } = useToast()

  const handleSaveApiKey = async (provider: string, apiKey: string) => {
    try {
      if (!selectedTemId) {
        toast({
          title: "Selecione a equipe primeiro",
          description:
            "Você precisa selecionar uma equipe antes de salvar a API Key.",
          variant: "destructive",
        })
        return
      }

      const isSaving =
        provider === "OpenAI" ? setIsSavingOpenAi : setIsSavingGroqAi
      isSaving(true)

      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedTemId,
          provider,
          apiKey,
        }),
      })

      if (response.ok) {
        toast({
          title: "API Key salva com sucesso",
          description: `A API Key do ${provider} foi salva com sucesso.`,
        })
      } else {
        const error = await response.json()
        console.error(`Erro ao salvar a API Key do ${provider}:`, error)
      }
    } catch (error) {
      console.error(`Erro ao salvar a API Key do ${provider}:`, error)
    }
  }

  return (
    <div>
      <Header title="Chaves de API" description="Gerencie suas chaves de API" />

      <section className="md:w-[70%]">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">API Keys externas</h2>
          <p className="text-sm text-gray-500">
            Configure as API Keys das suas LLMs favoritas.
          </p>
        </header>

        <div className="flex flex-col gap-5 mt-8">
          <section className="w-full flex flex-col rounded-md border border-gray-300">
            <header className="p-4 flex items-center justify-between gap-2 bg-zinc-300 rounded-t-md">
              <Image
                src="/OpenAI_light.svg"
                width={1000}
                height={1000}
                alt="logo openAi"
                className="w-auto h-6 fill-surface-color-12"
              />
            </header>

            <div className="w-full px-5 flex items-center justify-between gap-2 rounded-lg py-3 border-none">
              <input
                type="text"
                placeholder="OpenAI"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                className="focus:outline-none flex-1"
              />
              <button
                onClick={() => handleSaveApiKey("OpenAI", openAiKey)}
                disabled={isSavingOpenAi}
                className="hover:text-blue-500 transition-all duration-200"
              >
                {isSavingOpenAi ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </section>

          <section className="w-full flex flex-col rounded-md border border-gray-300">
            <header className="p-4 flex items-center justify-between gap-2 bg-zinc-300 rounded-t-md">
              <Image
                src="/Groq_light.svg"
                width={1000}
                height={1000}
                alt="logo openAi"
                className="w-auto h-6 fill-surface-color-12"
              />
            </header>

            <div className="w-full px-5 flex items-center justify-between gap-2 rounded-lg py-3 border-none">
              <input
                type="text"
                placeholder="GroqAI"
                value={groqAiKey}
                onChange={(e) => setGroqAiKey(e.target.value)}
                className="focus:outline-none flex-1"
              />
              <button
                onClick={() => handleSaveApiKey("GroqAI", groqAiKey)}
                disabled={isSavingGroqAi}
                className="hover:text-blue-500 transition-all duration-200"
              >
                {isSavingGroqAi ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
