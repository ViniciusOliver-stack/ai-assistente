import { Label } from "@/components/ui/label"
import {
  TabsContentModels,
  TabsListModels,
  TabsModels,
  TabsTriggerModels,
} from "./models/tabs"
import { ModelOpenAI } from "./models/openai"
import { ModelGroqCloud } from "./models/groqcloud"
import { useState } from "react"

export function ModelAgents() {
  const [selectedAI, setSelectedAI] = useState<string>("openAi")

  return (
    <section>
      <Label>Modelos</Label>
      <TabsModels
        onValueChange={(value) => setSelectedAI(value)}
        defaultValue="openAi"
        className="flex flex-col"
      >
        <TabsListModels className="items-start">
          <TabsTriggerModels value="openAi">Open AI</TabsTriggerModels>
          <TabsTriggerModels value="groq">Groq Cloud</TabsTriggerModels>
        </TabsListModels>
        <TabsContentModels value="openAi">
          <ModelOpenAI />
        </TabsContentModels>
        <TabsContentModels className="w-full" value="groq">
          <ModelGroqCloud selectedAI={selectedAI} />
        </TabsContentModels>
      </TabsModels>
    </section>
  )
}
