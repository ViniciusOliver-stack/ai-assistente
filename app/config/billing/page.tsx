import { Header } from "@/components/header"
import Plans from "@/components/plans"

export default function BillingPage() {
  return (
    <section>
      <Header title="Meu plano" description="Gerencie o seu plano" />
      <Plans />
    </section>
  )
}
