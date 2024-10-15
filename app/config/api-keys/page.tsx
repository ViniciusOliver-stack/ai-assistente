import { Header } from "@/components/header"

export default function ApiKeysPage() {
  return (
    <div>
      <Header title="Chaves de API" description="Gerencie suas chaves de API" />

      <section>
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">API Keys externas</h2>
          <p className="text-sm text-gray-500">
            Configure as API Keys das suas LLMs favoritas.
          </p>
        </header>
      </section>
    </div>
  )
}
