"use client"

import Image from "next/image"

import { BentoCard } from "@/components/ui/bento-card"
import { AnimatedList } from "@/components/animations/animated-list"
import { pollsData } from "@/lib/mocks"
import { EngagementAnimation } from "../animations/engagement-animation"
import { IntegrationsAnimation } from "../animations/integrations-animation"
import { IAMessageAnimation } from "../animations/ia-message-animation"
import { PollChart } from "../poll-chart"
import { Marquee } from "../animations/marquee"

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="flex items-center flex-col w-[80%] mx-auto space-y-2 py-8"
    >
      <h2 className="text-2xl md:text-3xl font-semibold text-center">
        Conheça nossos benefícios
      </h2>
      <p className="text-foreground/80 max-w-xl text-center pb-8">
        Descubra como a Rubnik pode transformar e proporcionar experiências
        inesquecíveis para seus clientes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-4 w-full">
        <BentoCard
          title="Potencialize Experiências"
          description="Chega de textões robotizados. Nossos Agentes conversam igual gente."
          icon="/emotions/the-robot.png"
          className="md:row-span-2 md:max-lg:col-span-2"
        >
          <div className="grid p-4 gap-4 max-lg:[mask-image:linear-gradient(to_top,transparent_30%,#000_80%)]">
            <AnimatedList
              delay={1000}
              clearOnEnd={false}
              className="flex-col-reverse"
            >
              <IAMessageAnimation
                from="Rubnik"
                message="Oi! Tudo bem? Como posso lhe ajudar hoje?"
              />
              <p className="border bg-primary/25 border-primary/50 text-secondary-foreground/75 shadow p-4 rounded-lg text-sm leading-relaxed max-w-[95%] ml-auto text-end">
                Tudo ótimo! Queria saber se vocês entregam no meu endereço.
              </p>
              <IAMessageAnimation from="Rubnik" message="Claro! Qual o CEP?" />
              <p className="border bg-primary/25 border-primary/50 text-secondary-foreground/75 shadow p-4 rounded-lg text-sm leading-relaxed max-w-[95%] ml-auto text-end">
                04567-123
              </p>
              <IAMessageAnimation
                from="Rubnik"
                message="Ótimo! A gente entrega sim. E o melhor: o frete é gratuito para sua região."
              />
            </AnimatedList>
          </div>
        </BentoCard>
        <BentoCard
          title="Integrações poderosas"
          description="Integração com as melhores IA e WhatsApp para potencializar a experiência de uso do seu agente."
          icon="/emotions/crystal-ball.png"
          className="md:col-span-2"
        >
          <div className="flex items-center justify-center absolute inset-x-0 bottom-4 size-full">
            <IntegrationsAnimation />
          </div>
        </BentoCard>
        <BentoCard
          title="Se um já é bom, imagine um time de funcionários de IA"
          description="Conheça alguns dos cargos que os agentes de IA da Rubnik podem ocupar"
          // description="Tenha a configuração dos agentes de modo fácil, rápido e em um só lugar!"
          icon="/emotions/raising-hand.png"
          className="md:row-span-2"
        >
          <div className="absolute w-full [mask-image:linear-gradient(to_top,transparent_10%,#000_60%)] max-md:h-[280px]">
            <EngagementAnimation className="border-none bg-transparent" />
          </div>
        </BentoCard>
        {/* <BentoCard
          title="Evento à moda do participante"
          description="Personalize a experiência do participante com base em suas preferências e comportamentos."
          icon="/emotions/sunglasses.png"
        >
          <Calendar
            mode="single"
            selected={new Date(2022, 4, 11, 0, 0, 0)}
            className="bg-muted/25 absolute scale-110 right-0 top-10 origin-top rounded-md border [mask-image:linear-gradient(to_top,transparent_50%,#000_80%)] pointer-events-none"
          />
        </BentoCard> */}
        <div className="flex flex-col md:row-span-2">
          <BentoCard
            title="Aumente sua produtividade"
            description="Automatize tarefas e processos, otimize a gestão e qualidade dos atendimentos deixando os processos repetitivos por conta do IA e libere sua equipe para focar no que realmente importa."
            icon="/emotions/speech-bubble.png"
            className="flex-grow"
          >
            <Image
              src="/qrcode.png"
              height={410}
              width={557}
              alt=""
              className="w-72 mx-auto p-4 [mask-image:linear-gradient(to_top,transparent_10%,#000_70%)] pointer-events-none"
            />
          </BentoCard>
        </div>
        <BentoCard
          title="Avalie e otimize"
          description="Acompanhe o desempenho do seu evento em tempo real e tome decisões mais assertivas."
          icon="/emotions/star.png"
          className="md:max-lg:col-span-2"
        >
          <div className="[mask-image:linear-gradient(to_top,transparent_10%,#000_70%)]">
            <Marquee
              pauseOnHover
              className="[--duration:20s] scale-[85%] overflow-visible"
            >
              {pollsData.map((poll) => (
                <PollChart
                  title={poll.title}
                  data={poll.data}
                  key={poll.title}
                  className="pointer-events-none min-w-64"
                />
              ))}
            </Marquee>
          </div>
        </BentoCard>
      </div>
    </section>
  )
}
