"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { HomeIcon, Menu, SettingsIcon, User } from "lucide-react"
import Link from "next/link"
import { ButtonSignOut } from "./ui/button-signout"
import Image from "next/image"
import useTeamStore from "@/store/team-store"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getTeams } from "@/app/_actions/get-teams"
import { Team } from "@prisma/client"

export function SidebarMobile() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const pathname = usePathname()
  const pathnameContains = (path: string) => pathname.includes(path)
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
    <aside className="block md:hidden">
      <Sheet>
        <SheetTrigger className="px-4 py-3">
          <Menu size={22} />
        </SheetTrigger>
        <SheetContent className="border-none flex flex-col justify-between">
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
              <SheetClose
                className="flex items-center gap-2 p-2 text-neutral-900 hover:bg-neutral-600 text-sm rounded-md"
                asChild
              >
                <Link
                  href="/dashboard"
                  className={`${
                    pathnameContains("/config") ? "text-blue-500" : ""
                  } flex items-center gap-2 p-2 hover:bg-neutral-600 text-sm rounded-md`}
                >
                  <HomeIcon size={18} />
                  Dashboard
                </Link>
              </SheetClose>

              <SheetClose
                className="flex items-center gap-2 p-2 text-neutral-900 hover:bg-neutral-600 text-sm rounded-md"
                asChild
              >
                <Link
                  href="/agents"
                  className={`${
                    pathnameContains("/agents") ? "text-blue-500" : ""
                  } flex items-center gap-2 p-2 hover:bg-neutral-600 text-sm rounded-md`}
                >
                  <User size={18} />
                  Agentes
                </Link>
              </SheetClose>

              <SheetClose
                className="flex items-center gap-2 p-2 text-neutral-900 hover:bg-neutral-600 text-sm rounded-md"
                asChild
              >
                <Link
                  href="/config/profile"
                  className={`${
                    pathnameContains("/config") ? "text-blue-500" : ""
                  } flex items-center gap-2 p-2 hover:bg-neutral-600 text-sm rounded-md`}
                >
                  <SettingsIcon size={18} />
                  Configurações
                </Link>
              </SheetClose>
            </nav>
          </div>

          <footer className="flex items-center justify-between">
            <ButtonSignOut />
          </footer>
        </SheetContent>
      </Sheet>
    </aside>
  )
}
