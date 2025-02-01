"use client"

import { useEffect, useState } from "react"
import useTeamStore from "@/store/team-store"
import { getListAgents } from "@/app/_actions/get-list-agents"

import Title from "@/components/ui/title"
import Link from "next/link"
import React from "react"
import { BoltIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TextLoader } from "@/components/ui/loading-text"
import { CountAgents } from "../_actions/cout-agents"
import { useRouter } from "next/navigation"
import { useTrialStore } from "@/store/use-trial-store"

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

export default function Agents() {
  const selectedTeamId = useTeamStore((state) => state.selectedTeamId)
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentCount, setAgentCount] = useState(0)
  const [hasActiveSub, setHasActiveSub] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isTrialExpired } = useTrialStore()

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        if (selectedTeamId) {
          const listAgents = await getListAgents(selectedTeamId)
          const countResponse = await CountAgents(selectedTeamId)
          setAgents(listAgents)
          setAgentCount(countResponse!)
          console.log(listAgents.length)
        } else {
          console.log("Selecione uma equipe")
        }
      } catch (error) {
        console.error(error)
        alert("Erro ao obter agentes")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserTeams()
  }, [selectedTeamId]) //Se colocar agents como dependência, é feito várias chamadas

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/user/subscription-status")
        const data = await res.json()
        console.log(data.isActive)
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

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full h-auto flex items-center justify-center">
          <TextLoader
            messages={[
              "Carregando agentes",
              "Preparando a sua experiência",
              "Quase lá",
            ]}
          />
        </div>
      </div>
    )
  }

  return (
    <section>
      <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between">
        <div>
          <Title
            title="Agentes"
            description="Gerencie seus agentes para automatizar tarefas de forma inteligente"
          />
        </div>

        <div>
          <Button
            asChild
            disabled={isLoading || agentCount >= 1}
            className="hover:bg-blue-500 transition-all delay-100 disabled:cursor-not-allowed"
          >
            <Link href="/agents/new">Criar novo agente</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,_minmax(17.5rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(24.25rem,_1fr))] gap-3 mt-10">
        {agents.length === 0 ? (
          <p className="mt-10 text-lg">Você ainda não criou nenhum agente.</p>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="grid grid-cols-[repeat(auto-fill,_minmax(17.5rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(24.25rem,_1fr))] gap-3 mt-10"
            >
              <div className="p-5 pr-7 h-60 flex flex-col gap-5 bg-surface-color-03/30 border border-surface-color-04/50 rounded-md overflow-hidden">
                <header className="w-full h-full flex flex-col gap-3 justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-4">
                      <h3 className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {agent.title}
                      </h3>
                      <Link href={`/agents/${agent.id}`}>
                        <BoltIcon size="22" />
                      </Link>
                    </div>
                    <p className="line-clamp-3 break-words text-gray-400">
                      {agent.description}
                    </p>
                  </div>

                  <p className="text-sm font-medium">{agent.providerModel}</p>
                </header>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
