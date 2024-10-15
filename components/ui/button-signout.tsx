"use client"

import { LogOutIcon } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export function ButtonSignOut() {
  const { status } = useSession()

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (status === "authenticated") {
    return (
      <button
        className="w-full flex items-center justify-between bg-transparent"
        onClick={() => signOut({ callbackUrl: "/auth" })}
      >
        Sair
        <LogOutIcon size={16} />
      </button>
    )
  }

  return <p>Você não está autenticado.</p>
}
