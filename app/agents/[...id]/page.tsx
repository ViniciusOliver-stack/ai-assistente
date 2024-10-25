"use client"

import Title from "@/components/ui/title"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LaptopIcon, MessageSquare, Settings2, Terminal } from "lucide-react"
import { PanelAgents } from "../(components)/panel"
import { ModelAgents } from "../(components)/model"
import { ModelsPrompt } from "../(components)/prompt"
import ChatLayout from "../(components)/chat"

export default function AgentDetails({ params }: { params: { id: string } }) {
  const id = params.id[0]

  return (
    <div>
      <Title title="Agente" description="Edite e personalize o seu Agente" />

      <Tabs defaultValue="panel" className="flex">
        <TabsList className="flex-col items-start">
          <TabsTrigger value="panel">
            <LaptopIcon size={18} />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare size={18} />
            Conversas
          </TabsTrigger>
          <TabsTrigger value="model">
            <Settings2 size={18} />
            Modelo
          </TabsTrigger>
          <TabsTrigger value="prompt">
            <Terminal size={18} />
            Prompt
          </TabsTrigger>
        </TabsList>

        <TabsContent className="w-full px-20" value="panel">
          <PanelAgents id={id} />
        </TabsContent>
        <TabsContent className="w-full px-20" value="chat">
          <ChatLayout />
        </TabsContent>
        <TabsContent className="px-20" value="model">
          <ModelAgents />
        </TabsContent>
        <TabsContent className="w-full px-20" value="prompt">
          <ModelsPrompt />
        </TabsContent>
      </Tabs>

      {/* <section className="mt-4">
        <h1>Editar Agente: {agent.title}</h1>
      </section> */}
    </div>
  )
}
