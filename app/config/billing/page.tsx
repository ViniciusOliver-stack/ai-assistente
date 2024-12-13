import { Header } from "@/components/header"
import Plans from "@/components/plans"

export default function BillingPage() {
  return (
    <div className="w-[80%] mx-auto">
      <Header title="Meu plano" description="Gerencie o seu plano" />
      <Plans />
    </div>
  )
}
