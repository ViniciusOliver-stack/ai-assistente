"use client"

import AddMemberForm from "@/components/add-member-form"
import CreateTeamFrom from "@/components/create-team-form"
import { Header } from "@/components/header"
import TeamList from "@/components/team-list"

export default function TeamPage() {
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

        <div className="space-y-8 px-2">
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
        </div>
      </div>
    </section>
  )
}
