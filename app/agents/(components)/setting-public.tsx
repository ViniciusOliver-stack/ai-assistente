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
import { v4 as uuidv4 } from "uuid"

interface WhatsAppProfile {
  owner?: string
  profileName?: string
  profilePictureUrl?: string | null
  profileStatus?: string
}

interface ConnectionResponse {
  base64: string
  qrcode?: {
    base64: string
  }
  instance?: WhatsAppInstance["instance"]
}

interface InstanceData {
  instance: {
    instanceName: string
    status: string
  }
}

interface WhatsAppInstance {
  id: string
  name: string
  connectionStatus: string
  ownerJid: string | null
  profileName: string | null
  profilePicUrl: string | null
  integration: string
  number: string | null
  businessId: string | null
  token: string
  clientName: string
  Setting: {
    id: string
    rejectCall: boolean
    msgCall: string
    groupsIgnore: boolean
    alwaysOnline: boolean
    readMessages: boolean
    readStatus: boolean
    syncFullHistory: boolean
  }
}

interface DBWhatsAppInstance {
  id: string
  instanceName: string
  instanceId: string
  status: string
  apiKey?: string
  integration: string
  serverUrl: string
  webhookUrl?: string
}

interface SettingPublicProps {
  teamId: string
  agentId: string
}

export default function SettingPublic({ teamId, agentId }: SettingPublicProps) {
  const { toast } = useToast()

  const [instanceValue, setInstanceValue] = useState("")
  const [instance, setInstance] = useState<WhatsAppInstance | undefined>(
    undefined
  )
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<
    "waiting" | "success" | "failed"
  >("waiting")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [dbInstance, setDbInstance] = useState<DBWhatsAppInstance | null>(null)
  const pendingInstanceRef = useRef<WhatsAppInstance | null>(null)

  // Armazena o nome completo da instância (com UUID) em uma ref para persistência
  const instanceNameRef = useRef<string | null>(null)

  const handleInputInstance = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cleanName = event.target.value.split("_")[0]
    setInstanceValue(cleanName)
  }

  const generateInstanceName = (baseName: string) => {
    const uuid = uuidv4()
    return `${baseName}_${uuid}`
  }

  function generateUniqueToken(): string {
    return randomBytes(32).toString("hex")
  }

  useEffect(() => {
    const fetchInstance = async () => {
      try {
        const response = await fetch(
          `/api/whatsapp/instance?teamId=${teamId}&agentId=${agentId}`
        )
        if (response.ok) {
          const data = await response.json()
          setDbInstance(data)
          if (data?.instanceName) {
            setInstanceValue(data.instanceName.split("_")[0])
            const instanceData = {
              id: data.instanceId,
              name: data.instanceName,
              connectionStatus: data.status,
              integration: data.integration,
              Setting: {
                id: "",
                rejectCall: false,
                msgCall: "",
                groupsIgnore: false,
                alwaysOnline: false,
                readMessages: false,
                readStatus: false,
                syncFullHistory: false,
              },
            }
            setInstance(instanceData as WhatsAppInstance)
          }
        }
      } catch (error) {
        console.error("Error fetching instance:", error)
      }
    }

    fetchInstance()
  }, [teamId, agentId])

  const saveInstanceToDatabase = async (instanceData: WhatsAppInstance) => {
    console.log("Instance DATA RECEBIDO: ", instanceData)
    try {
      const response = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: instanceData.name,
          displayName: instanceValue,
          instanceId: instanceData.id,
          status: instanceData.connectionStatus,
          integration: instanceData.integration,
          serverUrl: "https://evolution.rubnik.com",
          teamId: teamId,
          agentId: agentId,
        }),
      })

      console.log("RESPONSE:", response)

      if (!response.ok) {
        throw new Error("Erro ao salvar instância no banco de dados")
      }

      toast({
        title: "Instância salva com sucesso",
        description: "Sua instância do WhatsApp foi salva com sucesso!",
      })
    } catch (error) {
      console.error("Error saving instance:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados da instância.",
        variant: "destructive",
      })
    }
  }

  const checkInstanceStatus = async () => {
    if (!instanceValue) return null

    try {
      const response = await fetch(
        "https://evolution.rubnik.com/instance/fetchInstances",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: "qbTMAT9bS7VZAXB2WWIL7NW9gL3hY7fn",
          },
        }
      )
      const instances: WhatsAppInstance[] = await response.json()
      const targetInstance = instances.find(
        (inst) => inst.name === instanceNameRef.current
      )

      console.log("INSTANCES TARGET:", targetInstance)

      if (targetInstance) {
        console.log("Entrou na instância")
        setInstance(targetInstance)
        await saveInstanceToDatabase(targetInstance)

        if (targetInstance.connectionStatus === "open") {
          setConnectionStatus("success")
          toast({
            title: "Conexão estabelecida",
            description: "Sua instância do WhatsApp foi conectada com sucesso!",
          })
          stopCountdown()
          return true
        }
      }

      setConnectionStatus("failed")
      toast({
        title: "Conexão não estabelecida",
        description:
          "Não foi possível conectar sua instância. Tente novamente.",
        variant: "destructive",
      })
      return false
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      setConnectionStatus("failed")
      return false
    }
  }

  const handleDeleteInstance = async () => {
    console.log("Deletando instância...")
    console.log("Instance Name:", instance?.name)
    try {
      // Disconnect Instance WhatsApp
      await fetch(
        `https://evolution.rubnik.com/instance/logout/${instance?.name}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            apikey: "qbTMAT9bS7VZAXB2WWIL7NW9gL3hY7fn",
          },
        }
      )

      // Delete from local database
      await fetch(`/api/whatsapp/instance`, {
        method: "DELETE",
        body: JSON.stringify({
          agentId: dbInstance?.id,
        }),
      })

      setDbInstance(null)
      setInstance(undefined)
      setInstanceValue("")

      toast({
        title: "Instância excluída",
        description: "A instância foi removida com sucesso.",
      })
    } catch (error) {
      console.error("Error deleting instance:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a instância.",
        variant: "destructive",
      })
    }
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
        `https://evolution.rubnik.com/instance/connect/${instanceValue}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: "qbTMAT9bS7VZAXB2WWIL7NW9gL3hY7fn",
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
      const uniqueInstanceName = generateInstanceName(instanceValue)
      instanceNameRef.current = uniqueInstanceName

      const response = await fetch(
        "https://evolution.rubnik.com/instance/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "qbTMAT9bS7VZAXB2WWIL7NW9gL3hY7fn",
          },
          body: JSON.stringify({
            instanceName: uniqueInstanceName,
            token: token,
            qrcode: true,
            integration: "WHATSAPP-BAILEYS",
            rejectCall: true,
            groupsIgnore: true,
            alwaysOnline: false,
            readMessages: true,
            readStatus: true,
            websocket: {
              enabled: true,
              events: [
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
                "TYPEBOT_CHANGE_STATUS",
                "TYPEBOT_START",
                "REMOVE_INSTANCE",
                "LABELS_ASSOCIATION",
                "LABELS_EDIT",
                "LOGOUT_INSTANCE",
              ],
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao criar conexão")
      }

      const data: ConnectionResponse = await response.json()

      // Armazena os dados da instância para salvar posteriormente
      if (data.instance) {
        const instanceData = {
          ...data.instance,
          displayName: instanceValue, // Store original name for display
          instanceName: uniqueInstanceName, // Store full name with UUID
        }
        pendingInstanceRef.current = { instance: instanceData }
      }

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

  // console.log("Instancia", instance)

  return (
    <section className="">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between ">
        <div>
          <h1 className="text-lg font-medium">WhatsApp</h1>
          <p className="text-sm text-gray-500">
            Conecte seu WhatsApp ao seu Agente para receber e enviar mensagens
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="hover:bg-blue-500 transition-all delay-100 mt-4 md:mt-0 dark:text-neutral-900 disabled:dark:text-neutral-900 hover:dark:text-white duration-200 ease-in-out"
              disabled={!!dbInstance}
            >
              Conectar conta
            </Button>
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
                className="mt-2 w-full dark:text-neutral-900 hover:bg-blue-500 hover:dark:text-white transition-all duration-200 ease-in-out"
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
        <div className="bg-white dark:bg-transparent py-4 px-10 ring-1 ring-slate-900/5 rounded-lg shadow-lg dark:shadow-sm dark:shadow-black/90 w-full flex items-center justify-between mt-8">
          <p>{instance.name.split("_")[0]}</p>
          <div className="flex gap-2">
            <div className="flex items-center justify-center gap-1.5 w-full">
              <div className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getStatusColor(
                    instance.connectionStatus
                  )} opacity-75`}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${getStatusColor(
                      instance.connectionStatus
                    )}`}
                  ></span>
                </span>
              </div>
              <p className="text-xs font-medium">
                {getStatusLabel(instance.connectionStatus)}
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
                  <strong>{instance.name}</strong> não será possível recuperar
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
