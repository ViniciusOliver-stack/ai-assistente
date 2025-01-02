"use client"

import { createCheckoutSessionAction } from "@/app/_actions/billing-stripe"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    id: "basic",
    name: "Básico",
    subtitle: "Para quem quer experimentar",
    maxTeams: 1,
    description: [
      "1 Agente Inteligente",
      "1 Banco de conhecimento",
      "Interações ilimitadas no Whatsapp",
      "Acesso a recursos essenciais do Super Agente",
      "Suporte prioritário",
      "X vagas no time",
    ],
    maxMembersPerTeam: 5,

    priceId: "price_1Q8AJoDgEDIMcktiZLmEKDB0",
  },
  {
    id: "operational",
    name: "Operacional",
    subtitle:
      "Perfeito para pequenos negócios começarem com IA conversacional.",
    maxTeams: 3,
    description: [
      "1 Agente Inteligente",
      "1 Banco de conhecimento",
      "Interações ilimitadas no Whatsapp",
      "Acesso a recursos essenciais do Super Agente",
      "Suporte prioritário",
      "X vagas no time",
    ],
    maxMembersPerTeam: 10,
    price: "R$89,90",
    priceId: "price_1Q8AKCDgEDIMckti1uwWdTOM",
  },
  {
    id: "management",
    name: "Gerencial",
    subtitle:
      "Para empresas em crescimento que desejam escalar seu atendimento.",
    maxTeams: 10,
    description: [
      "1 Agente Inteligente",
      "1 Banco de conhecimento",
      "Interações ilimitadas no Whatsapp",
      "Acesso a recursos essenciais do Super Agente",
      "Suporte prioritário",
      "X vagas no time",
    ],
    maxMembersPerTeam: 50,
    price: "R$ 299,90",
    priceId: "price_1Q8Wa7DgEDIMcktihOkWYPNh",
  },
  {
    id: "executive",
    name: "Executivo",
    subtitle:
      "Projetado para empresas que buscam automatizar e aprimorar significativamente suas operações.",
    maxTeams: 5,
    description: [
      "1 Agente Inteligente",
      "1 Banco de conhecimento",
      "Interações ilimitadas no Whatsapp",
      "Acesso a recursos essenciais do Super Agente",
      "Suporte prioritário",
      "X vagas no time",
    ],
    maxMembersPerTeam: 20,

    price: "R$ 999,90",
    priceId: "price_1Q8AKiDgEDIMcktiUNVjqRlj",
  },
]

export default function Plans() {
  return (
    <div className="mx-auto select-none">
      <h1 className="text-xl mb-6">Planos disponíveis</h1>
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(20rem,_1fr))] gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="px-6 py-6 md:py-8 sm:mx-8 lg:mx-0 h-full flex flex-col gap-2 justify-between rounded-md relative shadow-md border bg-card text-card-foreground"
          >
            <h2 className="text-base font-semibold leading-7 text-black dark:text-white">
              {plan.name}
            </h2>
            {plan.price && (
              <div>
                <p className="text-2xl font-bold tracking-tight inline-block text-black dark:text-white">
                  {plan.price}
                </p>
                <span className="text-xs text-neutral-600 dark:text-neutral-300">
                  /mês
                </span>
              </div>
            )}
            <p className="text-sm leading-7 text-neutral-600">
              {plan.subtitle}
            </p>

            <ul className="list-inside">
              {plan.description.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-x-3 mt-2 text-sm font-medium leading-6"
                >
                  <Check size="16" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Botão de Seleção de Plano */}
            <form action={() => createCheckoutSessionAction(plan.priceId)}>
              <Button
                disabled={plan.id === "basic"}
                type="submit"
                className="mt-6 text-white py-2 px-4 rounded w-full dark:text-neutral-900 hover:bg-blue-500 hover:dark:text-white transition-all duration-200 ease-in-out"
              >
                Assinar Mensal
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
