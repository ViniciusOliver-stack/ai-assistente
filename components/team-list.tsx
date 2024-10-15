"use client"

import { useEffect, useState } from "react"
import useTeamStore from "@/store/team-store"
import { GetUsersTeam } from "@/app/_actions/get-users-team"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TeamList() {
  const [teams, setTeams] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [membersCount, setMembersCount] = useState(0)
  const [memberLimit, setMemberLimit] = useState(0)

  const selectedTemId = useTeamStore((state) => state.selectedTeamId)

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        if (selectedTemId) {
          const { team, membersCount, membersLimit } = await GetUsersTeam(
            selectedTemId
          )
          setTeams(team)
          setMembersCount(membersCount)
          setMemberLimit(membersLimit)
        } else {
          console.log("Selecione uma equipe")
        }
      } catch (error) {
        console.error(error)
        alert("Erro ao obter equipes")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserTeams()
  }, [selectedTemId])

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!teams) return

  return (
    <>
      <p className="font-medium text-gray-400 text-sm">
        {membersCount}/{memberLimit} vagas utilizadas
      </p>

      {teams ? (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Equipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.members.map((member) => {
                return (
                  <TableRow key={member.user.id}>
                    {member.user && (
                      <>
                        <TableCell className="font-medium">
                          {member.user.name}
                        </TableCell>
                        <TableCell>{member.user.email}</TableCell>
                      </>
                    )}

                    {member.role && (
                      <TableCell>
                        <p
                          className={`${
                            member.role === "admin"
                              ? "bg-emerald-500"
                              : "bg-blue-500"
                          } inline-flex px-2 py-1 rounded-md text-xs`}
                        >
                          {member.role}
                        </p>
                      </TableCell>
                    )}

                    {teams.name && (
                      <TableCell className="text-right">{teams.name}</TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>Nenhuma equipe selecionada.</p>
      )}
    </>
  )
}
