import { useEffect, useMemo, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { usePathname } from "next/navigation"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useToast } from "@/hooks/use-toast"
import {
  BotIcon,
  BotOff,
  CopyIcon,
  MessageSquare,
  SendHorizonalIcon,
  Trash2Icon,
  User2Icon,
  X,
} from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useChatListStore } from "@/store/useChatListStore"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ChatLayout() {
  const pathname = usePathname()
  // const agentId = pathname.split("/")[2]
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const {
    messages,
    isAIEnabled,
    isLoading,
    newMessage,
    currentChatId,
    setCurrentChatId,
    loadMessagesForChat,
    setIsAIEnabled,
    setNewMessage,
    sendManualMessage,
  } = useChatStore()

  const { chats, activeChat, setActiveChat } = useChatListStore()

  // Encontra o chat ativo e seu número de telefone
  const activePhoneNumber = useMemo(() => {
    const activeUser = chats.find((chat) => chat.id === activeChat)
    return activeUser?.phoneNumber
  }, [activeChat, chats])

  // Sincroniza o chat ativo entre as duas stores
  useEffect(() => {
    if (activeChat && activeChat !== currentChatId) {
      setCurrentChatId(activeChat)
    }
  }, [activeChat, currentChatId])

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId)
  }

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  console.log("Contato ativo", activeChat)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (activePhoneNumber) {
        sendManualMessage(activePhoneNumber, newMessage)
        setNewMessage("")
      }
    }
  }

  const handleSendMessage = () => {
    if (activePhoneNumber) {
      sendManualMessage(newMessage, activePhoneNumber)
    } else {
      toast({
        title: "Erro",
        description:
          "Não foi possível enviar a mensagem: número de telefone não encontrado",
        variant: "destructive",
      })
    }
  }

  const renderers = {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
      <div className="w-1/4 bg-white border-r border-gray-200 p-4">
        <div className="h-[calc(100vh-8rem)] overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`mb-4 p-3 hover:bg-gray-100 rounded-lg cursor-pointer ${
                activeChat === chat.id ? "bg-gray-100" : ""
              }`}
              onClick={() => handleChatSelect(chat.id)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{chat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(chat.timestamp)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>

                {chat.unreadCount > 0 && (
                  <span className="bg-blue-500 text-primary-foreground text-xs rounded-full px-2 flex items-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área principal do chat */}
      {currentChatId ? (
        <div className="flex-1 flex flex-col">
          {/* Cabeçalho do chat */}
          <div className="bg-white p-4 shadow-sm flex justify-end items-center">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIEnabled(!isAIEnabled)}
              >
                {isAIEnabled ? (
                  <BotOff className="w-4 h-4 mr-2" />
                ) : (
                  <BotIcon className="w-4 h-4 mr-2" />
                )}
                {isAIEnabled ? "Desabilitar IA" : "Habilitar IA"}
              </Button>
              <Button variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Encerrar chamado
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-red-400 hover:text-white"
              >
                <Trash2Icon className="w-4 h-4 mr-2" />
                Deletar conversa
              </Button>
            </div>
          </div>

          {/* Mensagens do chat */}
          <div className="flex-1 px-4  space-y-4">
            <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-18rem)]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "ai" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`flex ${
                      message.sender === "ai" ? "flex-row-reverse" : "flex-row"
                    } items-end`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          message.sender === "ai"
                            ? "/user-avatar.png"
                            : "/other-avatar.png"
                        }
                      />
                      <AvatarFallback>
                        <User2Icon size={18} />
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`mx-2 py-2 px-4 rounded-2xl ${
                        message.sender === "ai"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <ReactMarkdown components={renderers}>
                          {message.text}
                        </ReactMarkdown>
                      ) : (
                        message.text
                      )}

                      <div className="text-[10px] text-gray-500 text-right mt-1">
                        {formatTimestampToTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-end">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/other-avatar.png" />
                      <AvatarFallback>O</AvatarFallback>
                    </Avatar>
                    <div className="m-2 p-2 rounded-2xl bg-secondary text-secondary-foreground">
                      <div className="dots-loading">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input de mensagem */}
          {!isAIEnabled && activePhoneNumber && (
            <div className=" p-4 border-t border-gray-200">
              <form className="" onSubmit={(e) => e.preventDefault()}>
                <div className="flex space-x-2 items-center">
                  <textarea
                    placeholder="Mensagem"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow p-2 border rounded-md resize-none focus:outline-none"
                    rows={1}
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !newMessage.trim()}
                  >
                    Enviar
                    <SendHorizonalIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Selecione um chat para começar</p>
        </div>
      )}
    </div>
  )
}
