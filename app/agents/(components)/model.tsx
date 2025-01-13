import { Label } from "@/components/ui/label"
import {
  TabsContentModels,
  TabsListModels,
  TabsModels,
  TabsTriggerModels,
} from "./models/tabs"
import { ModelOpenAI } from "./models/openai"
import { ModelGroqCloud } from "./models/groqcloud"
import { useEffect, useState } from "react"
import useTeamStore from "@/store/team-store"
import { getListModelsWithApiKey } from "@/app/_actions/get-list-models"

interface ModelAvailable {
  provider: string
}

const MODEL_MAPPING = {
  OPENAI: {
    value: "openAi",
    label: "Open AI",
    component: ModelOpenAI,
  },
  GROQ: {
    value: "groqCloud",
    label: "Groq Cloud",
    component: ModelGroqCloud,
  },
}

export function ModelAgents() {
  const selectedTeamId = useTeamStore((state) => state.selectedTeamId)
  const [selectedAI, setSelectedAI] = useState<string>("")
  const [modelAvailable, setModelAvailable] = useState<ModelAvailable[]>([])

  useEffect(() => {
    const fetchModelsAvailable = async () => {
      try {
        if (selectedTeamId) {
          const listModels = await getListModelsWithApiKey(selectedTeamId)

          const uniqueModels = listModels.filter(
            (model, index, self) =>
              index === self.findIndex((m) => m.provider === model.provider)
          )

          setModelAvailable(uniqueModels)

          if (listModels.length > 0) {
            const firstProvider = listModels[0].provider.toUpperCase()
            setSelectedAI(
              MODEL_MAPPING[firstProvider as keyof typeof MODEL_MAPPING]
                ?.value || ""
            )
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchModelsAvailable()
  }, [selectedTeamId])

  //Inicia vazio e depois carrega os modelos
  // console.log(modelAvailable)

  return (
    <section>
      {modelAvailable.length > 0 ? (
        <div>
          <Label>Modelos</Label>
          <TabsModels
            onValueChange={(value) => setSelectedAI(value)}
            value={selectedAI}
            className="flex flex-col"
          >
            <TabsListModels className="items-start">
              {modelAvailable.map((model) => {
                const providerKey =
                  model.provider.toUpperCase() as keyof typeof MODEL_MAPPING
                const mappedModel = MODEL_MAPPING[providerKey]

                if (!mappedModel) return null

                return (
                  <TabsTriggerModels
                    key={mappedModel.value}
                    value={mappedModel.value}
                  >
                    {mappedModel.label}
                  </TabsTriggerModels>
                )
              })}
            </TabsListModels>

            {modelAvailable.map((model) => {
              const providerKey =
                model.provider.toUpperCase() as keyof typeof MODEL_MAPPING
              const mappedModel = MODEL_MAPPING[providerKey]

              if (!mappedModel) return null

              const Component = mappedModel.component

              return (
                <TabsContentModels
                  key={mappedModel.value}
                  value={mappedModel.value}
                >
                  <Component
                    selectedAI={mappedModel.value}
                    teamId={selectedTeamId as string}
                  />
                </TabsContentModels>
              )
            })}
          </TabsModels>
        </div>
      ) : (
        <p>Nenhum modelo disponível.</p>
      )}
    </section>
  )
}
