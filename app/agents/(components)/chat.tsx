import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { usePathname } from "next/navigation"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useToast } from "@/hooks/use-toast"
import { CopyIcon } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"

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
    setIsAIEnabled,
    setNewMessage,
    sendManualMessage,
  } = useChatStore()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendManualMessage(newMessage)
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

  return (
    <div className="flex flex-col h-[calc(100vh_-_7rem)] border rounded-lg overflow-hidden">
      <Button onClick={() => setIsAIEnabled(!isAIEnabled)}>
        {isAIEnabled ? "Desabilitar IA" : "Habilitar IA"}
      </Button>

      <div className="flex-grow p-4 overflow-auto">
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
                  {message.sender === "ai" ? "U" : "O"}
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

      {!isAIEnabled && (
        <form
          className="p-4 bg-background"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex space-x-2">
            <textarea
              placeholder="Mensagem"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow p-2 border rounded-md resize-none focus:outline-none"
              rows={1}
            />

            <Button
              onClick={() => sendManualMessage(newMessage)}
              disabled={isLoading}
            >
              Enviar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
