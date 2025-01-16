import { useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
//import { usePathname } from "next/navigation"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeftIcon,
  BotIcon,
  BotOff,
  CopyIcon,
  MessageSquare,
  MessageSquareOffIcon,
  SendHorizonalIcon,
  Trash2Icon,
  User2Icon,
} from "lucide-react"

import { useChatStore } from "@/store/useChatStore"
import { useChatListStore } from "@/store/useChatListStore"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Message } from "@/types/chat"

export default function ChatLayout() {
  //const pathname = usePathname()
  // const agentId = pathname.split("/")[2]
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const { toast } = useToast()
  const [isMobileListView, setIsMobileListView] = useState(true)
  const [combinedMessages, setCombinedMessages] = useState<Message[]>([])

  const {
    messages,
    isAIEnabled,
    isLoading,
    newMessage,
    currentChatId,
    messageHistory,
    setCurrentChatId,
    setIsAIEnabled,
    setNewMessage,
    sendManualMessage,
    loadMessagesForChat,
  } = useChatStore()

  const { chats, activeChat, setActiveChat, addOrUpdateChat } =
    useChatListStore()

  useEffect(() => {
    if (!activeChat) {
      setCombinedMessages([])
      return
    }

    // Pega o número do telefone do chat ativo
    const activeChatDetails = chats.find((chat) => chat.id === activeChat)
    const phoneNumber = activeChatDetails?.phoneNumber
    if (!phoneNumber) return

    // Normaliza o número de telefone para comparação
    const normalizedPhone = phoneNumber.replace(/^55/, "")

    // Pega o histórico de mensagens do chat ativo
    const chatHistory = messageHistory[activeChat] || []

    // Filtra as mensagens em tempo real para este chat específico
    const realtimeMessages = messages.filter((message) => {
      if (message.sender === "ai") {
        // Para mensagens da IA, verifica se o destinatário é o número do chat atual
        return message.messageTo?.replace(/^55/, "") === normalizedPhone
      } else {
        // Para mensagens do usuário, verifica se o remetente é o número do chat atual
        return message.sender?.replace(/^55/, "") === normalizedPhone
      }
    })

    // Combina histórico com mensagens em tempo real
    const allMessages = [...chatHistory, ...realtimeMessages]

    // Remove duplicatas baseado no ID da mensagem
    const uniqueMessages = allMessages.filter(
      (message, index, self) =>
        index === self.findIndex((m) => m.id === message.id)
    )

    // Ordena por timestamp
    const sortedMessages = uniqueMessages.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    setCombinedMessages(sortedMessages)
  }, [activeChat, messages, messageHistory, chats])

  // Efeito para carregar o histórico quando selecionar um chat
  useEffect(() => {
    if (activeChat) {
      loadMessagesForChat(activeChat)
    }
  }, [activeChat, loadMessagesForChat])

  useEffect(() => {
    if (activeChat) {
      loadMessagesForChat(activeChat)
    }
  }, [activeChat, loadMessagesForChat])

  // // Filtra as mensagens para o chat ativo
  // const activeMessages = useMemo(() => {
  //   if (!activeChat) return []

  //   return messages.filter((message) => {
  //     // Verifica se a mensagem pertence à conversação atual
  //     return message.conversationId === activeChat
  //   })
  // }, [messages, activeChat])

  // Encontra o chat ativo e seu número de telefone
  const activePhoneNumber = useMemo(() => {
    const activeUser = chats.find((chat) => chat.id === activeChat)
    return activeUser?.phoneNumber
  }, [activeChat, chats])

  const activeChatDetails = useMemo(
    () => chats.find((chat) => chat.id === activeChat),
    [activeChat, chats]
  )

  // Sincroniza o chat ativo entre as duas stores
  useEffect(() => {
    if (activeChat && activeChat !== currentChatId) {
      setCurrentChatId(activeChat)
    }
  }, [activeChat, currentChatId, setCurrentChatId])

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
    setCurrentChatId(chatId)
    setIsMobileListView(false)

    // Carrega as mensagens do chat selecionado
    loadMessagesForChat(chatId)

    // Reseta o contador de mensagens não lidas
    const chat = chats.find((chat) => chat.id === chatId)
    if (chat) {
      addOrUpdateChat({ ...chat, unreadCount: 0 })
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (activePhoneNumber) {
        sendManualMessage(newMessage, activePhoneNumber)
        setNewMessage("")
      }
    }
  }

  // Handle message sending
  const handleSendMessage = () => {
    if (!activeChatDetails?.phoneNumber) {
      toast({
        title: "Error",
        description: "Could not send message: phone number not found",
        variant: "destructive",
      })
      return
    }

    sendManualMessage(newMessage, activeChatDetails.phoneNumber)
  }

  const renderers = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ inline, className, children }: any) {
      const match = /language-(\w+)/.exec(className || "")
      const language = match ? match[1] : "text"

      const copyToClipboard = () => {
        navigator.clipboard.writeText(children)
        toast({
          title: "Código copiado!",
          description: "O código foi copiado para a área de transferência.",
        })
      }

      return !inline ? (
        <div className="relative">
          <SyntaxHighlighter language={language} style={dracula}>
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-2 bg-gray-800 text-white py-1 px-2 rounded text-xs flex items-center gap-1"
          >
            <CopyIcon size={14} /> Copiar
          </button>
        </div>
      ) : (
        <code className={className}>{children}</code>
      )
    },
  }

  // Função para verificar se o usuário está próximo do fim
  const isNearBottom = () => {
    const container = scrollContainerRef.current
    if (!container) return true

    const threshold = 100 // pixels do fundo
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    )
  }

  // Handler para scroll manual
  const handleScroll = () => {
    setShouldAutoScroll(isNearBottom())
  }

  // Efeito para scroll automático
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }
  }, [combinedMessages, shouldAutoScroll])

  function formatTimestampToTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  if (chats.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <MessageSquare className="w-12 h-12 mb-2" />
        <p className="text-sm">Nenhuma conversa ainda</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh_-_7rem)] border rounded-lg overflow-hidden">
      {/* Lista de chats */}
      <div
        className={`w-full md:w-1/4 bg-white dark:bg-neutral-950 border-r border-gray-200 ${
          activeChat && !isMobileListView ? "hidden md:block" : "block"
        }`}
      >
        <div className="h-full overflow-y-auto space-y-2 p-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
                activeChat === chat.id ? "bg-gray-100 dark:bg-zinc-800" : ""
              }`}
              onClick={() => handleChatSelect(chat.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark:text-white">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-200">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate max-w-[180px] dark:text-gray-100">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] rounded-full min-w-[15px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de mensagens */}
      <div
        className={`flex-1 flex flex-col bg-gray-50 dark:bg-neutral-900 ${
          activeChat && !isMobileListView ? "block" : "hidden md:block"
        }`}
      >
        {activeChat ? (
          <>
            <div className="bg-white dark:bg-neutral-900 p-4 shadow-sm flex justify-between items-center">
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileListView(true)}
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-x-2 flex justify-end items-end w-full select-none">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAIEnabled(!isAIEnabled)}
                  className="dark:bg-transparent dark:hover:bg-blue-500 dark:text-white hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out"
                >
                  {isAIEnabled ? (
                    <BotOff className="w-4 h-4 md:mr-2" />
                  ) : (
                    <BotIcon className="w-4 h-4 md:mr-2" />
                  )}
                  <p className="hidden md:inline">
                    {isAIEnabled ? "Desabilitar IA" : "Habilitar IA"}
                  </p>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="dark:bg-transparent dark:hover:bg-blue-500 dark:text-white hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out"
                >
                  <Trash2Icon className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Excluir conversa</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="dark:bg-transparent dark:hover:bg-blue-500 dark:text-white hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out"
                >
                  <MessageSquareOffIcon className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Fechar chat</span>
                </Button>

                <Select>
                  <SelectTrigger className="w-fit h-[33px] dark:bg-transparent dark:hover:bg-blue-500 dark:text-white hover:bg-blue-500 hover:text-white transition-all duration-200 ease-in-out">
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      Vinicius Santos Oliveira
                    </SelectItem>
                    <SelectItem value="dark">Tarcísio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="w-[90vw] md:w-full flex-1 overflow-y-auto p-4"
            >
              {combinedMessages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <p>Nenhuma mensagem para exibir</p>
                </div>
              ) : (
                combinedMessages.map((message, index) => {
                  console.log("Rendering message:", message)
                  const isAI = message.sender === "ai"

                  return (
                    <div
                      key={message.id || index}
                      className={`flex ${
                        isAI ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      <div
                        className={`max-w-[70%] flex items-end gap-2 ${
                          isAI ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {isAI ? (
                              <BotIcon size="18" />
                            ) : (
                              <User2Icon size="18" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`py-2 px-4 rounded-xl ${
                            isAI
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-neutral-800"
                          }`}
                        >
                          {isAI ? (
                            <ReactMarkdown components={renderers}>
                              {message.text}
                            </ReactMarkdown>
                          ) : (
                            <p>{message.text}</p>
                          )}
                          <div
                            className={`${
                              isAI ? "text-white" : "text-neutral-900"
                            } text-[10px] text-gray-500 text-right mt-1`}
                          >
                            <span className="dark:text-white">
                              {formatTimestampToTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {!isAIEnabled && (
              <div className="p-4 bg-white border-t dark:bg-neutral-900">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="self-end"
                  >
                    <SendHorizonalIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
