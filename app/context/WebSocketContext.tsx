"use client"

import { useChatListStore } from "@/store/useChatListStore"
import { useChatStore } from "@/store/useChatStore"
import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null)
  const { addMessage, formatMessage, isAIEnabled, currentChatId } =
    useChatStore()
  const { updateLastMessage } = useChatListStore()

  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket"],
    })

    socketRef.current.on("connect", () => {
      console.log("Conectado ao WebSocket")
    })

    socketRef.current.on("new_message", (messageData) => {
      console.log("Nova mensagem recebida:", messageData)
      const formattedMessage = formatMessage(messageData)
      addMessage(formattedMessage)

      // Atualiza a lista de chats apenas para mensagens de usuário
      if (messageData.sender !== "ai") {
        updateLastMessage(
          messageData.sender,
          messageData.text,
          messageData.timestamp || new Date().toISOString(),
          false // não é mensagem da IA
        )
      }
    })

    socketRef.current.on("new_message_ai", (messageData) => {
      console.log("Nova resposta da IA:", messageData)
      const formattedMessage = formatMessage(messageData)
      addMessage(formattedMessage)

      // Para respostas da IA, atualizamos o chat do usuário que recebeu a resposta
      if (messageData.recipientId) {
        updateLastMessage(
          messageData.recipientId,
          messageData.text,
          messageData.timestamp,
          true // é mensagem da IA
        )
      }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [addMessage, formatMessage, currentChatId, isAIEnabled, updateLastMessage])

  return <>{children}</>
}
