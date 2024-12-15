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
import { Team } from "@prisma/client"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [teams, setTeams] = React.useState<Team[]>([])
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(null)
  const setSelectedTeamId = useTeamStore((state) => state.setSelectedTeamId)

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const fetchedTeams = await getTeams()
        setTeams(fetchedTeams)
        // Seleciona a primeira equipe automaticamente
        if (fetchedTeams.length >= 1) {
          const firstTeam = fetchedTeams[0]
          setActiveTeam(firstTeam)
          setSelectedTeamId(firstTeam.id)
        }
      } catch (error) {
        console.error("Erro ao obter equipes:", error)
      }
    }

    fetchTeams()
  }, [setSelectedTeamId])

  const handleTeamChange = (team: Team) => {
    setActiveTeam(team)
    setSelectedTeamId(team.id)
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
                {team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default TeamSwitcher
