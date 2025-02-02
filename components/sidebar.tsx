"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HomeIcon, SettingsIcon, User } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useSession } from "next-auth/react"
import { ButtonSignOut } from "./ui/button-signout"
import { usePathname } from "next/navigation"
import { getTeams } from "@/app/_actions/get-teams"
import { useEffect, useState } from "react"
import { Team } from "@prisma/client"
import useTeamStore from "@/store/team-store"
import Image from "next/image"

export default function Sidebar() {
  const { data: session } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const pathname = usePathname()
  const pathnameContains = (path: string) => pathname.includes(path)
  const nameFallback = session?.user?.name?.substring(0, 1).toUpperCase()
  const setSelectedTeamId = useTeamStore((state) => state.setSelectedTeamId)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const fetchedTeams = await getTeams()
        setTeams(fetchedTeams)
        // Seleciona a primeira equipe automaticamente
        if (fetchedTeams.length >= 1) {
          const firstTeamId = fetchedTeams[0].id
          setSelectedTeam(firstTeamId)
          setSelectedTeamId(firstTeamId)
        }
      } catch (error) {
        console.error("Erro ao obter equipes:", error)
      }
    }

    fetchTeams()
  }, [setSelectedTeamId])

  return (
    <aside className="w-64 shadow-md hidden md:flex px-3 py-5 flex-col justify-between">
      <div>
        <div className="h-12">
          <Image src="/logo.svg" alt="logo" width={120} height={120} />
        </div>
        <div className="pb-5">
          <Select
            value={selectedTeam}
            onValueChange={(value) => {
              setSelectedTeam(value)
              setSelectedTeamId(value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a equipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 p-2 hover:bg-neutral-600 text-sm rounded-md"
          >
            <HomeIcon size={18} />
            Dashboard
          </Link>

          <Link
            href="/agents"
            className={`${
              pathnameContains("/agents") ? "text-blue-500" : ""
            } flex items-center gap-2 p-2 hover:bg-neutral-600 text-sm rounded-md`}
          >
            <User size={18} />
            Agentes
          </Link>
          <Link
            href="/config/profile"
            className={`${
              pathnameContains("/config") ? "text-blue-500" : ""
            } flex items-center gap-2 p-2 hover:bg-neutral-600 text-sm rounded-md`}
          >
            <SettingsIcon size={18} />
            Configurações
          </Link>
        </nav>
      </div>

      <footer className="flex items-end justify-end w-full">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 focus:outline-none">
            <p className="font-medium">Minha conta</p>
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-red-500">
                {nameFallback}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/config/profile">Meu Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/config/team">Minhas Equipes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/config/billing">Meu Plano</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ButtonSignOut />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </aside>
  )
}
