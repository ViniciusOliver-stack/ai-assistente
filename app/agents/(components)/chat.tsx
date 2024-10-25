import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Message = {
  id: number
  text: string
  sender: "client" | "ai"
}

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Olá! Como você está?", sender: "ai" },
    { id: 2, text: "Oi! Estou bem, e você?", sender: "client" },
    { id: 3, text: "Também estou bem, obrigado!", sender: "ai" },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: newMessage, sender: "client" },
      ])
      setNewMessage("")
    }
  }

  return (
    <div className="flex flex-col h-screen border rounded-lg overflow-hidden">
      <div className="flex-grow p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "client" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`flex ${
                message.sender === "client" ? "flex-row-reverse" : "flex-row"
              } items-end`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    message.sender === "client"
                      ? "/user-avatar.png"
                      : "/other-avatar.png"
                  }
                />
                <AvatarFallback>
                  {message.sender === "client" ? "U" : "O"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`mx-2 py-2 px-4 rounded-2xl ${
                  message.sender === "client"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-background">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Enviar</Button>
        </div>
      </form>
    </div>
  )
}
