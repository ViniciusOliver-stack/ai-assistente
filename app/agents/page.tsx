"use client"

import { useEffect, useState } from "react"
import useTeamStore from "@/store/team-store"
import { getListAgents } from "@/app/_actions/get-list-agents"

import Title from "@/components/ui/title"
import Link from "next/link"
import React from "react"
import { BoltIcon } from "lucide-react"

type Agent = {
  id: string
  title: string
  description: string
  enterprise: string
  providerModel: string
  temperature: number | null
  restrictionContent: boolean
  languageDetector: boolean
  prompt: string
  teamId: string
  tokenId: string
}

export default function Agents() {
  const selectedTeamId = useTeamStore((state) => state.selectedTeamId)
  const [isLoading, setIsLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        if (selectedTeamId) {
          const listAgents = await getListAgents(selectedTeamId)

          setAgents(listAgents)
          console.log(agents)
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
  }, [selectedTeamId])

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <section>
      <Title
        title="Agentes"
        description="Gerencie seus agentes para automatizar tarefas de forma inteligente"
      />

      <div>
        <Link href="/agents/new">Criar novo agente</Link>
      </div>

      {agents.length === 0 ? (
        <p>Você ainda não criou nenhum agente.</p>
      ) : (
        agents.map((agent) => (
          <div
            key={agent.id}
            className="grid grid-cols-[repeat(auto-fill,_minmax(17.5rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(24.25rem,_1fr))] gap-3"
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
    </section>
  )
}
