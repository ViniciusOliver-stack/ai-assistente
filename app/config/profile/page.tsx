"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [username, setUsername] = useState(session?.user?.name || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const userId = session?.user.id //Esse ID existe

  const { toast } = useToast()

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !username) return

    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newUsername: username,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Usuário atualizado com sucesso",
          description: "Sua conta foi atualizada com sucesso",
        })
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao atualizar usuário")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div>
      <Header
        title="Minha Conta"
        description="Gerencie as informações da sua conta"
      />

      <div className="space-y-8">
        <div>
          <h3 className="text-xl">Configurações de perfil</h3>
          <p className="text-gray-400 text-sm">
            Atualize suas informações de perfil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">E-mail</Label>
            <Input
              id="email"
              type="email"
              disabled
              value={session?.user?.email as string}
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Usuário</Label>
            <Input
              id="username"
              type="text"
              placeholder={session?.user?.name as string}
              value={username}
              onChange={handleUsernameChange}
            />
          </div>

          <Button
            disabled={!username || isUpdating}
            className="disabled:cursor-not-allowed"
          >
            {isUpdating ? "Atualizando..." : "Atualizar"}
          </Button>
        </form>
      </div>
    </div>
  )
}