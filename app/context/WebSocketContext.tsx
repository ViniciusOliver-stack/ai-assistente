"use client"

import useTeamStore from "@/store/team-store"
import { useChatListStore } from "@/store/useChatListStore"
import { useChatStore } from "@/store/useChatStore"
import { useCallback, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

interface WebSocketProviderProps {
  children: React.ReactNode
}

interface MessageData {
  agentTitle?: string
  hasAudio?: boolean
  messageTo?: string
  instanceName?: string
  status?: string
  isTranscribed: boolean
  sender: string
  text: string
  timestamp: string
  conversationId: string
  id: string
  metadata: {
    instance?: string
    ticketNumber?: string
    instanceName?: string
    isAiResponse?: boolean
    model?: string
  }
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null)

  const { updateLastMessage, addOrUpdateChat } = useChatListStore()
  const { addMessage } = useChatStore()
  const { selectedTeamId, selectedAgentId, selectedInstanceId } = useTeamStore()

  // Keep track of processed message IDs
  const processedMessageIds = useRef(new Set<string>())

  const isMessageForCurrentInstance = useCallback(
    (messageData: MessageData) => {
      const messageInstance =
        messageData.metadata.instance || messageData.metadata.instanceName
      const isValidInstance = messageInstance === selectedInstanceId

      console.log("isMessageForCurrentInstance", isValidInstance)

      return isValidInstance
    },
    [selectedInstanceId]
  )

  const processMessage = useCallback(
    (messageData: MessageData, isAI: boolean) => {
      // Skip if message was already processed
      if (processedMessageIds.current.has(messageData.id)) {
        return
      }

      // Skip if message is not for current instance
      if (!isMessageForCurrentInstance(messageData)) {
        return
      }

      // Add message ID to processed set
      processedMessageIds.current.add(messageData.id)

      console.log("Processing message:", messageData)

      // Ensure the message has a conversationId
      const messageWithConversationId = {
        ...messageData,
        conversationId: messageData.conversationId || messageData.sender,
      }

      // Add message to chat store
      addMessage(messageWithConversationId)

      const chatData = {
        id: messageWithConversationId.conversationId,
        name: isAI ? messageData.messageTo : messageData.sender,
        phoneNumber: isAI ? messageData.messageTo : messageData.sender,
        lastMessage: messageData.text,
        timestamp: messageData.timestamp,
        unreadCount: 0,
        status: messageData.status || "OPEN",
        ticketNumber: messageData.metadata.ticketNumber,
        instance: selectedInstanceId,
        selectedTeamId,
        selectedAgentId,
      }

      addOrUpdateChat(chatData)

      if (messageData.text) {
        updateLastMessage(
          isAI ? (messageData.messageTo as string) : messageData.sender,
          messageData.text,
          messageData.timestamp,
          isAI
        )
      }
    },
    [
      isMessageForCurrentInstance,
      addMessage,
      addOrUpdateChat,
      updateLastMessage,
      selectedInstanceId,
      selectedTeamId,
      selectedAgentId,
    ]
  )

  useEffect(() => {
    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket"],
      query: {
        selectedInstanceId,
        selectedTeamId,
        selectedAgentId,
      },
    })

    socketRef.current.on("connect", () => {
      console.log("WebSocket Connected")

      // Join instance-specific room
      socketRef.current?.emit("join_instance", {
        selectedInstanceId,
        selectedTeamId,
        selectedAgentId,
      })
    })

    socketRef.current.on("new_message", (message) => {
      processMessage(message, false)
    })

    socketRef.current.on("new_message_ai", (message) => {
      processMessage(message, true)
    })

    return () => {
      socketRef.current?.disconnect()
      // Clear processed messages on unmount
      processedMessageIds.current.clear()
    }
  }, [processMessage])

  return <>{children}</>
}
