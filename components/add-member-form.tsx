"use client"

import useTeamStore from "@/store/team-store"
import { useState } from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"

export default function AddMemberForm() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [isAdding, setIsAdding] = useState(false)

  const selectedTemId = useTeamStore((state) => state.selectedTeamId)
  const { toast } = useToast()

  const handleAddMember = async (e) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedTemId, email, role }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Membro adicionado com sucesso!",
          description: "Solicitar verificar caixa de email.",
        })
      } else {
        toast({
          title: "Erro ao adicionar membro",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setEmail("")
      setRole("member")
      setIsAdding(false)
    }
  }

  return (
    <form onSubmit={handleAddMember} className="space-y-4">
      <div className="flex gap-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="memberEmail">Email</Label>
          <Input
            id="memberEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 border rounded"
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="role">Função</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="admin">Administrador</option>
            <option value="member">Membro</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isAdding || !email}
        className="text-white rounded"
      >
        {isAdding ? "Adicionando..." : "Adicionar Membro"}
      </Button>
    </form>
  )
}
