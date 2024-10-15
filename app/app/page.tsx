"use client"

import Title from "@/components/ui/title"
import { useSession } from "next-auth/react"

export default function App() {
  const { data: session } = useSession()

  return (
    <div>
      <Title
        title="Agentes"
        description="Gerencie seus agentes para automatizar tarefas de forma inteligente"
      />

      <p>{session?.user?.email}</p>
    </div>
  )
}
