"use client"

import Image from "next/image"
import { useState } from "react"
import { signIn } from "next-auth/react"

import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export default function Auth() {
  const [email, setEmail] = useState<null | string>(null)
  const date = new Date()
  const year = date.getFullYear()

  const { toast } = useToast()
  const { theme } = useTheme()

  const getLogoSrc = () => {
    switch (theme) {
      case "light":
        return "/logo.svg"
      case "dark":
        return "/logo-white.svg"
      default:
        return "/logo-white.svg"
    }
  }

  async function SignInWithEmail() {
    const signInResult = await signIn("email", {
      email: email,
      callbackUrl: "/dashboard",
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
        <Image src={getLogoSrc()} alt="logo rubnik" width={150} height={150} />
        <div className="flex flex-col w-[380px] max-w-[90%] py-8 px-6 gap-6 rounded-lg bg-neutral-200/50 dark:bg-white transition-all">
          <form action={SignInWithEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-normal text-neutral-600 dark:text-neutral-700"
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
            <Button
              type="submit"
              className="w-full dark:bg-neutral-900 dark:text-white dark:hover:bg-blue-500 hover:bg-blue-500 hover:text-white"
            >
              Entrar
            </Button>
          </form>
        </div>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
          Ao clicar em entrar, você concorda com nossos{" "}
          <a href="#">Termos e serviços</a> e{" "}
          <a href="#">Política de Privacidade</a>.
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
