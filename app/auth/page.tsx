"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function Auth() {
  const [email, setEmail] = useState<null | string>(null)

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
    <div>
      <form action={SignInWithEmail}>
        <Input
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          type="email"
        />
        <Button type="submit">Sign Up Magic Link</Button>
      </form>
    </div>
  )
}
