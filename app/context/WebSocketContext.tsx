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
  const { updateLastMessage, addOrUpdateChat } = useChatListStore()

  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket"],
    })

    socketRef.current.on("connect", () => {
      console.log("Conectado ao WebSocket")
    })

    socketRef.current.on("new_message", (messageData) => {
      console.log("Nova mensagem recebida:", messageData)

      // Formata a mensagem do usuário
      const formattedMessage = formatMessage({
        id: messageData.id,
        text: messageData.text,
        sender: messageData.sender, // número do telefone do usuário
        timestamp: messageData.timestamp,
        messageTo: null, // mensagem do usuário não tem destinatário
      })

      // Adiciona a mensagem ao chat
      addMessage(formattedMessage)

      // Atualiza a lista de chats
      addOrUpdateChat({
        id: messageData.sender, // usa o número do telefone como ID
        name: messageData.sender,
        phoneNumber: messageData.sender,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 0,
      })

      // Atualiza o último status da mensagem
      updateLastMessage(
        messageData.sender,
        messageData.text,
        messageData.timestamp,
        false
      )
    })

    socketRef.current.on("new_message_ai", (messageData) => {
      console.log("Nova resposta da IA:", messageData)

      // Formata a mensagem da IA
      const formattedMessage = formatMessage({
        id: messageData.id,
        text: messageData.text,
        sender: "ai",
        timestamp: messageData.timestamp,
        messageTo: messageData.messageTo, // número do telefone do destinatário
      })

      // Adiciona a mensagem ao chat
      addMessage(formattedMessage)

      // Atualiza o último status da mensagem no chat do usuário
      if (messageData.messageTo) {
        updateLastMessage(
          messageData.messageTo,
          messageData.text,
          messageData.timestamp,
          true
        )
      }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [
    addMessage,
    formatMessage,
    currentChatId,
    isAIEnabled,
    updateLastMessage,
    addOrUpdateChat,
  ])

  return <>{children}</>
}
