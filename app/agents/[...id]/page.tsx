"use client"

import Title from "@/components/ui/title"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GlobeIcon,
  LaptopIcon,
  MessageSquare,
  Settings2,
  Terminal,
} from "lucide-react"
import { PanelAgents } from "../(components)/panel"
import { ModelAgents } from "../(components)/model"
import { ModelsPrompt } from "../(components)/prompt"
import ChatLayout from "../(components)/chat"
import SettingPublic from "../(components)/setting-public"
import { useState } from "react"

const tabTitles = {
  panel: {
    title: "Visão Geral",
    description: "Visualize informações gerais do seu agente",
  },
  chat: {
    title: "Conversas",
    description: "Acompanhe e gerencie todas as interações",
  },
  model: {
    title: "Modelo",
    description: "Configure o modelo de IA do seu agente",
  },
  prompt: {
    title: "Prompt",
    description: "Personalize os prompts do seu agente",
  },
  "setting-public": {
    title: "Publicar",
    description: "Configure as opções de publicação do seu agente",
  },
}

type TabType = "panel" | "chat" | "model" | "prompt" | "setting-public"

export default function AgentDetails({ params }: { params: { id: string } }) {
  const id = params.id[0]
  const [activeTab, setActiveTab] = useState<TabType>("panel")

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
  }

  return (
    <section>
      <Title
        title={tabTitles[activeTab].title}
        description={tabTitles[activeTab].description}
      />

      <Tabs
        defaultValue="panel"
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col md:items-center md:justify-center max-w-full px-1"
      >
        <TabsList className="items-start flex-wrap w-full md:flex-row md:gap-8 mt-4">
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

          <TabsTrigger value="setting-public">
            <GlobeIcon size={18} />
            Publicar
          </TabsTrigger>
        </TabsList>

        <div className="w-full h-[1px] bg-neutral-200 mt-3 md:mt-6" />

        <TabsContent className="w-full pt-6 md:pt-8" value="panel">
          <PanelAgents id={id} />
        </TabsContent>
        <TabsContent
          className="max-w-[100vw] md:w-full pt-6 md:pt-8"
          value="chat"
        >
          <ChatLayout
          // instanceId="b3d522d4-8708-48c9-b55d-6bbc93531fff"
          // teamId="cm578za6z0008q3a8fufu6y1j"
          // agentId="gsk_2IszyB5xTBVJjWpJEiGSWGdyb3FYLsHPYRYHqSKjQaoKuJ1Jz9I41b9oub1g"
          />
        </TabsContent>
        <TabsContent className="w-full pt-6 md:pt-8" value="model">
          <ModelAgents />
        </TabsContent>
        <TabsContent className="w-full pt-6 md:pt-8" value="prompt">
          <ModelsPrompt />
        </TabsContent>
        <TabsContent className="w-full pt-6 md:pt-8" value="setting-public">
          <SettingPublic
            agentId="gsk_2IszyB5xTBVJjWpJEiGSWGdyb3FYLsHPYRYHqSKjQaoKuJ1Jz9I41b9oub1g"
            teamId="cm578za6z0008q3a8fufu6y1j"
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
