"use client"

import CreateTeamFrom from "@/components/create-team-form"
import { Header } from "@/components/header"
import { TextLoader } from "@/components/ui/loading-text"
import { useTrialStore } from "@/store/use-trial-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// import AddMemberForm from "@/components/add-member-form"
// import TeamList from "@/components/team-list"

export default function TeamPage() {
  const { isTrialExpired, isTrialStarted, checkTrialStatus } = useTrialStore()
  const [hasActiveSub, setHasActiveSub] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/user/subscription-status")
        const { isActive } = await res.json()
        setHasActiveSub(isActive)
      } catch (error) {
        console.error("Error checking access:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])
  if (loading)
    return (
      <div className="w-full h-auto flex items-center justify-center">
        <TextLoader
          messages={[
            "Carregando a sua equipe",
            "Preparando a sua experiência",
            "Quase lá",
          ]}
        />
      </div>
    )

  // Não mostra a navegação se o trial não foi iniciado ou expirou
  if (!hasActiveSub && isTrialExpired) {
    router.push("/dashboard")
  }

  return (
    <section>
      <Header
        title="Organização"
        description="Faça o gerenciamento da sua equipe"
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl">Configurações da Equipe</h3>
            <p className="text-gray-400 text-sm">
              Personalize o nome e a descrição da sua equipe.
            </p>
          </div>
          <CreateTeamFrom />
        </div>

        {/* <div className="space-y-8 px-2">
          <div>
            <h3 className="text-xl">Membros da equipe</h3>
            <p className="text-gray-400 text-sm">
              Convide um novo membro para colaborar
            </p>
          </div>
          <AddMemberForm />
        </div>

        <div>
          <h3 className="text-xl">Suas Equipes</h3>
          <TeamList />
        </div> */}
      </div>
    </section>
  )
}
