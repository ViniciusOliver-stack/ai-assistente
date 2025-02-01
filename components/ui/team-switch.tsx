// components/ui/team-switcher.tsx
"use client"
import * as React from "react"
import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getTeams } from "@/app/_actions/get-teams"
import useTeamStore from "@/store/team-store"
import { Team, Agent, WhatsAppInstance } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useTrialStore } from "@/store/use-trial-store"

interface TeamWithRelations extends Team {
  agents: (Agent & {
    WhatsAppInstance: WhatsAppInstance[]
  })[]
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [teams, setTeams] = React.useState<TeamWithRelations[]>([])
  const [activeTeam, setActiveTeam] = React.useState<TeamWithRelations | null>(
    null
  )
  const {
    setSelectedTeamId,
    setSelectedAgentId,
    setSelectedInstanceId,
    setSelectedAgentName,
    selectedAgentId,
    selectedAgentName,
  } = useTeamStore()

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const fetchedTeams = await getTeams()
        setTeams(fetchedTeams)

        if (fetchedTeams.length >= 1) {
          const firstTeam = fetchedTeams[0]
          setActiveTeam(firstTeam)
          setSelectedTeamId(firstTeam.id)
          setSelectedAgentName(firstTeam.name)

          // Somente define o primeiro agente se nenhum agente estiver selecionado
          if (!selectedAgentId && firstTeam.agents.length > 0) {
            const firstAgent = firstTeam.agents[0]
            setSelectedAgentId(firstAgent.id)
            setSelectedAgentName(firstTeam.name)

            if (firstAgent.WhatsAppInstance.length > 0) {
              setSelectedInstanceId(firstAgent.WhatsAppInstance[0].instanceName)
            }
          }
        }
      } catch (error) {
        console.error("Erro ao obter equipes:", error)
      }
    }

    fetchTeams()
  }, [
    setSelectedTeamId,
    setSelectedAgentId,
    setSelectedInstanceId,
    setSelectedAgentName,
    selectedAgentId,
  ])

  const handleTeamChange = (team: TeamWithRelations) => {
    setActiveTeam(team)
    setSelectedTeamId(team.id)

    // Encontra o agente correspondente no novo time
    const currentAgent = team.agents.find(
      (agent) => agent.id === selectedAgentId
    )

    // Se não encontrar o agente atual no novo time, seleciona o primeiro agente
    if (!currentAgent && team.agents.length > 0) {
      const firstAgent = team.agents[0]
      setSelectedAgentId(firstAgent.id)

      if (firstAgent.WhatsAppInstance.length > 0) {
        setSelectedInstanceId(firstAgent.WhatsAppInstance[0].instanceName)
      }
    }
  }

  if (!activeTeam) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-500 text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                {activeTeam.agents[0] && (
                  <span className="truncate text-xs text-muted-foreground">
                    {activeTeam.agents[0].title || "Agente padrão"}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Equipes
            </DropdownMenuLabel>
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamChange(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <GalleryVerticalEnd className="size-4 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span>{team.name}</span>
                  {team.agents[0] && (
                    <span className="text-xs text-muted-foreground">
                      {team.agents.length} agentes
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default TeamSwitcher
