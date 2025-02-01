"use client"

import { PricingCard } from "./pricing-card"

export default function Plans() {
  return (
    <div className="mx-auto select-none">
      <h1 className="text-xl mb-6">Planos disponíveis</h1>
      <PricingCard />
    </div>
  )
}
