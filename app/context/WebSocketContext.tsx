/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useChatListStore } from "@/store/useChatListStore"
import { useChatStore } from "@/store/useChatStore"
import { useCallback, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null)
  const { addMessage, formatMessage } = useChatStore()
  const { updateLastMessage, addOrUpdateChat } = useChatListStore()

  const handleNewMessage = useCallback(
    (messageData: any) => {
      // Remove o prefixo "55" do número do telefone se existir
      const normalizedPhoneNumber = messageData.sender.replace(/^55/, "")

      console.log("Mensagem DATA:", messageData)

      const formattedMessage = formatMessage({
        id: messageData.id,
        text: messageData.text,
        sender: messageData.sender,
        timestamp: messageData.timestamp,
        messageTo: messageData.recipientId,
        metadata: messageData.metadata,
        conversationId: messageData.conversationId,
      })

      addMessage(formattedMessage)

      // Create or update chat when receiving a new message
      const chatData = {
        id: messageData.conversationId || normalizedPhoneNumber,
        name: normalizedPhoneNumber,
        phoneNumber: normalizedPhoneNumber,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 1,
        status: messageData.status || "OPEN",
        ticketNumber: messageData.ticketNumber,
      }

      // Add or update the chat
      addOrUpdateChat(chatData)

      // Atualiza apenas se já existir um chat ou se for uma nova mensagem válida
      if (messageData.text) {
        updateLastMessage(
          normalizedPhoneNumber,
          messageData.text,
          messageData.timestamp,
          false
        )
      }
    },
    [formatMessage, addMessage, updateLastMessage, addOrUpdateChat]
  )

  const handleAIMessage = useCallback(
    (messageData: any) => {
      if (!messageData.messageTo) return

      const normalizedPhoneNumber = messageData.messageTo.replace(/^55/, "")

      const formattedMessage = formatMessage({
        id: messageData.id,
        text: messageData.text,
        sender: "ai",
        timestamp: messageData.timestamp,
        messageTo: messageData.messageTo,
        metadata: messageData.metadata,
        conversationId: messageData.conversationId,
      })

      addMessage(formattedMessage)

      // Update the chat with AI's response
      const chatData = {
        id: messageData.conversationId || normalizedPhoneNumber,
        name: normalizedPhoneNumber,
        phoneNumber: normalizedPhoneNumber,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 0, // Don't increment unread for AI messages
        status: messageData.status || "OPEN",
        ticketNumber: messageData.ticketNumber,
      }

      // Add or update the chat
      addOrUpdateChat(chatData)

      updateLastMessage(
        normalizedPhoneNumber,
        messageData.text,
        messageData.timestamp,
        true
      )
    },
    [formatMessage, addMessage, updateLastMessage, addOrUpdateChat]
  )

  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket"],
    })

    // socketRef.current = io(
    //   "https://assistent-ai-nodejs.3g77fw.easypanel.host",
    //   {
    //     transports: ["websocket"],
    //     path: "/socket.io",
    //   }
    // )

    socketRef.current.on("connect", () => {
      console.log("Conectado ao WebSocket")
    })

    socketRef.current.on("new_message", handleNewMessage)
    socketRef.current.on("new_message_ai", handleAIMessage)

    return () => {
      socketRef.current?.disconnect()
    }
  }, [handleAIMessage, handleNewMessage])

  return <>{children}</>
}
