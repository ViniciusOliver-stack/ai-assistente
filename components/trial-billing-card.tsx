import { AlertTriangle, ArrowUpRight, Check } from "lucide-react"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import Link from "next/link"

export function CardTrialBilling() {
  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto overflow-hidden shadow-xl">
        <CardHeader className="space-y-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-center mb-4">
            <Badge className="bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-2">
              <AlertTriangle size={14} />
              Período de teste expirado
            </Badge>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Seu período de teste acabou
          </h3>
          <p className="text-white/80">
            Para continuar usando nossa plataforma, escolha um plano de
            assinatura
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Check size={18} className="text-green-500" />
              Tenha o seu agente ativo
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Check size={18} className="text-green-500" />
              Suporte prioritário 24/7
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Check size={18} className="text-green-500" />
              Mantenha todos os seus dados e configurações
            </li>
          </ul>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 p-6 pt-0">
          <Link
            href={"/config/billing"}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 h-11 rounded-md"
          >
            <ArrowUpRight className="h-4 w-4" />
            Ver planos de assinatura
          </Link>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Ao clicar em começar, você concorda com nossos termos de serviço
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
