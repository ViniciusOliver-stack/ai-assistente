import { useState, useEffect, useRef } from "react"
import { randomBytes } from "crypto"
import Image from "next/image"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TrashIcon } from "lucide-react"

interface ConnectionResponse {
  base64: string
  qrcode?: {
    base64: string
  }
}

interface InstanceData {
  instance: {
    instanceName: string
    status: string
  }
}

export default function SettingPublic() {
  const { toast } = useToast()

  const [instanceValue, setInstanceValue] = useState("")
  const [instance, setInstance] = useState<InstanceData | undefined>(undefined)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<
    "waiting" | "success" | "failed"
  >("waiting")
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputInstance = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstanceValue(event.target.value)
  }

  function generateUniqueToken(): string {
    return randomBytes(32).toString("hex")
  }

  const checkInstanceStatus = async () => {
    if (!instanceValue) return null

    try {
      const response = await fetch(
        "https://symplus-evolution.3g77fw.easypanel.host/instance/fetchInstances",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey:
              "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
          },
        }
      )
      const instances: InstanceData[] = await response.json()

      const targetInstance = instances.find(
        (inst) => inst.instance.instanceName === instanceValue
      )

      console.log("Nome da instancia:", targetInstance)
      setInstance(targetInstance)

      if (targetInstance?.instance.status === "open") {
        setConnectionStatus("success")
        toast({
          title: "Conexão estabelecida",
          description: "Sua instância do WhatsApp foi conectada com sucesso!",
        })
        stopCountdown()
        return true
      } else {
        setConnectionStatus("failed")
        toast({
          title: "Conexão não estabelecida",
          description:
            "Não foi possível conectar sua instância. Tente novamente.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      setConnectionStatus("failed")
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível verificar o status da instância.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleDeleteInstance = async () => {
    await fetch(
      `https://symplus-evolution.3g77fw.easypanel.host/instance/delete/${instanceValue}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          apikey:
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
        },
      }
    )
  }

  const startCountdown = () => {
    // Para qualquer contagem em andamento
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Reinicia o contador para 30 segundos
    setRemainingTime(30)
    setConnectionStatus("waiting")

    // Inicia um novo intervalo
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // Quando chegar a 0, para o intervalo e verifica o status
          clearInterval(timerRef.current!)
          setRemainingTime(0)
          checkInstanceStatus()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const regenerateQRCode = async () => {
    // Para qualquer contagem em andamento
    stopCountdown()

    // Reinicia o estado de carregamento e status
    setIsLoading(true)
    setConnectionStatus("waiting")

    try {
      const response = await fetch(
        `https://symplus-evolution.3g77fw.easypanel.host/instance/connect/${instanceValue}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey:
              "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao regenerar QR Code")
      }

      const data: ConnectionResponse = await response.json()

      if (data.base64) {
        // Define o novo QR Code e inicia a contagem regressiva
        setQrCode(data.base64)
        startCountdown()
      }
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível regenerar o QR Code.",
        variant: "destructive",
      })
    } finally {
      // Finaliza o estado de carregamento
      setIsLoading(false)
    }
  }

  const fetchCreateConnection = async () => {
    const token = generateUniqueToken()
    setIsLoading(true)
    setQrCode(null)
    setConnectionStatus("waiting")

    try {
      const response = await fetch(
        "https://symplus-evolution.3g77fw.easypanel.host/instance/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey:
              "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
          },
          body: JSON.stringify({
            instanceName: instanceValue,
            token: token,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
            reject_call: true,
            groups_ignore: true,
            always_online: false,
            read_messages: true,
            read_status: true,
            websocket_enabled: true,
            websocket_events: [
              "APPLICATION_STARTUP",
              "QRCODE_UPDATED",
              "MESSAGES_SET",
              "MESSAGES_UPSERT",
              "MESSAGES_UPDATE",
              "MESSAGES_DELETE",
              "SEND_MESSAGE",
              "CONTACTS_SET",
              "CONTACTS_UPSERT",
              "CONTACTS_UPDATE",
              "PRESENCE_UPDATE",
              "CHATS_SET",
              "CHATS_UPSERT",
              "CHATS_UPDATE",
              "CHATS_DELETE",
              "GROUPS_UPSERT",
              "GROUP_UPDATE",
              "GROUP_PARTICIPANTS_UPDATE",
              "CONNECTION_UPDATE",
              "CALL",
              "NEW_JWT_TOKEN",
            ],
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao criar conexão")
      }

      const data: ConnectionResponse = await response.json()

      if (data.qrcode?.base64) {
        setQrCode(data.qrcode.base64)
        startCountdown()
      }
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a conexão.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Limpa os intervalos quando o componente é desmontado
  useEffect(() => {
    return () => {
      stopCountdown()
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "closed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "Conectado"
      case "connecting":
        return "Conectando"
      case "closed":
        return "Desconectado"
      default:
        return status
    }
  }

  console.log("Instancia", instance)

  return (
    <section className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Whatsapp</h1>
          <p className="text-sm text-gray-500">
            Conecte seu WhatsApp ao seu Agente para receber e enviar mensagens
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Conectar conta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conectar WhatsApp</AlertDialogTitle>
              <AlertDialogDescription>
                Faça a leitura do QR Code para começar a usar o agente no seu
                Whatsapp
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div>
              <input
                type="text"
                name="instance"
                id="instance"
                className="w-full p-2 border rounded"
                placeholder="Crie o nome da sua instância"
                value={instanceValue}
                onChange={handleInputInstance}
              />

              <Button
                onClick={fetchCreateConnection}
                disabled={!instanceValue || isLoading}
                className="mt-2 w-full"
              >
                {isLoading ? "Carregando..." : "Conectar"}
              </Button>

              {qrCode && (
                <div className="mt-4 flex flex-col items-center">
                  <Image
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    width={250}
                    height={250}
                    className="max-w-full"
                  />

                  {remainingTime > 0 ? (
                    <div className="mt-2 text-sm text-gray-600">
                      Tempo restante: {remainingTime} segundos
                    </div>
                  ) : null}

                  <Button
                    onClick={regenerateQRCode}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    {isLoading ? "Carregando..." : "Gerar Novo QR Code"}
                  </Button>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              {connectionStatus === "success" ? (
                <AlertDialogAction>Fechar</AlertDialogAction>
              ) : (
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {instance && (
        <div className="bg-white py-4 px-10 ring-1 ring-slate-900/5 rounded-lg shadow-lg w-full flex items-center justify-between mt-8">
          <p>{instance.instance.instanceName}</p>
          <div className="flex gap-2">
            <div className="flex items-center justify-center gap-1.5 w-full">
              <div className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(
                    instance.instance.status
                  )} opacity-75`}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor(
                      instance.instance.status
                    )}`}
                  ></span>
                </span>
              </div>
              <p className="text-xs font-medium">
                {getStatusLabel(instance.instance.status)}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger>
              <TrashIcon size={18} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ao realizar a exclusão da conexão{" "}
                  <strong>{instance.instance.instanceName}</strong> não será
                  possível recuperar
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500"
                  onClick={handleDeleteInstance}
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </section>
  )
}
