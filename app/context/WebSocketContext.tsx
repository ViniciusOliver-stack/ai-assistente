"use client"

import { useChatStore } from "@/store/useChatStore"
// WebSocketContext.tsx
import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null)
  const { addMessage, handleAIResponse, isAIEnabled } = useChatStore()

  useEffect(() => {
    socketRef.current = io(
      "https://symplus-evolution.3g77fw.easypanel.host/SymplusTalk",
      {
        transports: ["websocket"],
      }
    )

    socketRef.current.on("connect", () => {
      console.log("Conectado ao WebSocket globalmente")
    })

    socketRef.current.on("messages.upsert", async (messageData) => {
      console.log("Messages Upsert", messageData)

      const receivedMessage = {
        id: Date.now(),
        text: messageData.data.message.extendedTextMessage.text,
        sender: "client" as const,
      }

      addMessage(receivedMessage)

      if (isAIEnabled) {
        await handleAIResponse(
          receivedMessage.text,
          messageData.data.key.remoteJid.split("@")[0]
        )
      }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [addMessage, handleAIResponse, isAIEnabled])

  return <>{children}</>
}
