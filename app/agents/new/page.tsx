import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import Alert from "@/components/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function NewAgents() {
  return (
    <div>
      <header>
        <Link
          href="/agents"
          className="flex items-center gap-1 text-sm hover:text-blue-500 transition-all duration-200"
        >
          <ArrowLeftIcon size={18} />
          Voltar
        </Link>
      </header>

      <section className="w-full flex flex-col gap-6">
        <Alert title="Essas informações não afetam a respostas do seu Agente" />

        <form action="" className="flex flex-col gap-6">
          <div className="flex flex-col w-full max-w-lg gap-1.5">
            <Label htmlFor="teamName">Nome</Label>
            <Input
              id="teamName"
              type="text"
              required
              placeholder="Escreva o nome do agente"
            />
          </div>

          <div className="flex flex-col w-full max-w-lg gap-1.5">
            <Label htmlFor="teamName">Descrição</Label>
            <Textarea
              placeholder="Escreva o que seu agente faz"
              required
              className="resize-none"
            />
          </div>
        </form>
      </section>
    </div>
  )
}
