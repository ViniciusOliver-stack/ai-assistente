import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export function ModelOpenAI() {
  const [temperature, setTemperature] = useState<number>(1.5)

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Select>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
              <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
              <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
              <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
              <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
              <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
            </SelectGroup>

            <SelectGroup>
              <SelectLabel>South America</SelectLabel>
              <SelectItem value="art">Argentina Time (ART)</SelectItem>
              <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
              <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
              <SelectItem value="clt">Chile Standard Time (CLT)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          O modelo GPT 4o oferece respostas mais precisas e segue as instruções
          com mais eficácia.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <Label>Temperatura</Label>
          <p className="text-sm"> {temperature}</p>
        </div>
        <Slider
          defaultValue={[temperature]}
          max={2}
          step={0.1}
          onValueChange={(value) => setTemperature(value[0])}
        />
        <p className="text-xs text-gray-500 w-[400px] mt-2">
          A temperatura é um parâmetro que controla a aleatoriedade e
          criatividade das respostas do modelo. Com temperatura 0, as respostas
          são diretas e previsíveis. Com temperatura 1, as respostas variam
          bastante.
        </p>
      </div>

      <Button className="hover:bg-blue-500 w-fit">Salvar Alterações</Button>
    </section>
  )
}
