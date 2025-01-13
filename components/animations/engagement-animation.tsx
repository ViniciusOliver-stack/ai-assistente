"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "./animated-list"

interface Item {
  name: string
  description: string
  icon: string
  color: string
  time: string
}

let notifications = [
  {
    name: "SDR (Vendas)",
    description:
      "Claro Vinicius! Qual desses produtos você gostaria de saber mais?",
    time: "20m atrás",

    icon: "💸",
    color: "#00C9A7",
  },
  {
    name: "Suporte N1",
    description: "Claro Tarcísio, que tipo de viagem você está buscando?",
    time: "15m atrás",
    icon: "👤",
    color: "#FFB800",
  },
  {
    name: "RH",
    description: "Caio, segue a lista de vagas disponíveis:",
    time: "10m atrás",
    icon: "💬",
    color: "#FF3D71",
  },
  {
    name: "Copywriter",
    description: "Thiago, segue o link para o material de apoio:",
    time: "5m atrás",
    icon: "🗞️",
    color: "#1E86FF",
  },
  {
    name: "Tutor",
    description: "Luender, é recomendado que você assista a esses vídeos:",
    time: "2m atrás",
    icon: "🗞️",
    color: "#1E86FF",
  },
]

notifications = Array.from({ length: 10 }, () => notifications).flat()

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transform-gpu backdrop-blur-md border bg-muted/25 shadow",
        "transition-all duration-200 ease-in-out hover:scale-[103%]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-foreground">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-muted-foreground/75">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-muted-foreground line-clamp-1">
            {description}
          </p>
        </div>
      </div>
    </figure>
  )
}

export function EngagementAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[550px] w-full flex-col p-6 overflow-hidden rounded-lg border bg-background md:shadow-xl",
        className
      )}
    >
      <AnimatedList delay={1500}>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  )
}
