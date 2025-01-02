"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Spinner } from "./ui/spinner"
import { useRouter } from "next/navigation"

export function CheckAuthentication() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div>
        <Spinner />
      </div>
    )
  }

  return null
}
