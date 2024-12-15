"use client"

import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function CreateTeamFrom() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      alert("O nome da equipe é obrigatório.")
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Equipe criada com sucesso!",
          description: `A equipe ${name} foi criada com sucesso.`,
        })
        setName("")
        setDescription("")
        // Opcional: atualizar o estado da aplicação para refletir a nova equipe
      } else {
        toast({
          title: "Erro ao criar membro",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao criar equipe:", error)
      alert("Erro ao criar equipe.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col w-full max-w-sm gap-1.5">
          <Label htmlFor="teamName">Nome da Equipe</Label>
          <Input
            id="teamName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col w-full max-w-sm gap-1.5 ">
          <Label htmlFor="teamDescription">Descrição</Label>
          <Input
            id="teamDescription"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isCreating || !name}
        className="items-end hover:bg-blue-500 transition-all delay-100"
      >
        {isCreating ? "Criando..." : "Criar Equipe"}
      </Button>
    </form>
  )
}
