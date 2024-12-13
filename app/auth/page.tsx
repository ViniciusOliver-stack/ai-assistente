"use client"

import Image from "next/image"
import { useState } from "react"
import { signIn } from "next-auth/react"

import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Auth() {
  const [email, setEmail] = useState<null | string>(null)
  const date = new Date()
  const year = date.getFullYear()

  const { toast } = useToast()

  async function SignInWithEmail() {
    const signInResult = await signIn("email", {
      email: email,
      callbackUrl: "/app",
      redirect: false,
    })

    if (!signInResult?.ok) {
      toast({
        title: "Ops, houve um erro!",
        description: "Ocorreu um erro ao enviar o email, tente novamente.",
        variant: "destructive",
      })
    }

    setEmail("")
    toast({
      title: "Email enviado com sucesso!",
      description:
        "Um link de acesso foi enviado para o seu endereço de e-mail.",
    })
  }

  return (
    <div className="flex flex-1 flex-col justify-center items-center max-w-full h-screen select-none">
      <div className="flex-1 flex flex-col w-full justify-center items-center gap-6 transition-all ">
        <Image src="/logo.svg" alt="logo rubnik" width={150} height={150} />
        <div className="flex flex-col w-[380px] max-w-[90%] py-8 px-6 gap-6 rounded-lg bg-neutral-200/50 transition-all">
          <form action={SignInWithEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-light text-neutral-600"
              >
                Digite seu email
              </Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                id="email"
                type="email"
                placeholder="seu@email.com"
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
      <footer className="text-sm text-neutral-500 flex flex-col items-center gap-1 mb-8">
        <p>© {year} Rubnik -Todos os direitos reservados.</p>
        <a
          href="https://www.symplus.net/"
          target="_blank"
          className="hover:text-blue-500 transition-all delay-50"
        >
          Symplus
        </a>
      </footer>
    </div>
  )
}
