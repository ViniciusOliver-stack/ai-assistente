"use client"

import useTeamStore from "@/store/team-store"
import { useChatListStore } from "@/store/useChatListStore"
import { useChatStore } from "@/store/useChatStore"
import { useCallback, useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null)
  const { addMessage, formatMessage } = useChatStore()
  const { updateLastMessage, addOrUpdateChat } = useChatListStore()
  const [isConnected, setIsConnected] = useState(false)

  const { selectedTeamId, selectedAgentId, selectedInstanceId } = useTeamStore()

  // Função para validar se a mensagem pertence à instância atual
  const isMessageForCurrentInstance = useCallback(
    (messageData: any) => {
      const messageInstance =
        messageData.metadata?.instance || messageData.instanceName
      const isValidInstance = messageInstance === selectedInstanceId

      // console.log("Message Validation:", {
      //   messageInstance,
      //   currentInstance: selectedInstanceId,
      //   isValid: isValidInstance,
      //   messageData: {
      //     id: messageData.id,
      //     sender: messageData.sender,
      //     instance: messageInstance,
      //   },
      // })

      return isValidInstance
    },
    [selectedInstanceId]
  )

  const handleNewMessage = useCallback(
    (messageData: any) => {
      try {
        // console.log("Message DATA RECIPIENT: ")
        // console.log("Received new_message:", {
        //   messageId: messageData.id,
        //   instance: messageData.metadata?.instance,
        //   currentInstance: selectedInstanceId,
        // })

        if (!isMessageForCurrentInstance(messageData)) {
          // console.log("Message skipped - wrong instance")
          return
        }

        if (!messageData.sender && !isMessageForCurrentInstance(messageData)) {
          // console.log("Message skipped - no recipient")
          return
        }

        // const normalizedPhoneNumber = messageData.sender.replace(/^55/, "")

        const formattedMessage = formatMessage({
          id: messageData.id,
          text: messageData.text,
          sender: messageData.sender,
          timestamp: messageData.timestamp,
          messageTo: messageData.recipientId,
          metadata: {
            ...messageData.metadata,
            instance: selectedInstanceId,
            selectedTeamId,
            selectedAgentId,
          },
          conversationId: messageData.conversationId,
        })

        // console.log("Processing message for instance:", {
        //   instance: selectedInstanceId,
        //   messageId: messageData.id,
        //   sender: messageData.sender,
        // })

        addMessage(formattedMessage)

        const chatData = {
          id: messageData.conversationId || messageData.sender,
          name: messageData.sender,
          phoneNumber: messageData.sender,
          lastMessage: messageData.text,
          timestamp: messageData.timestamp,
          unreadCount: 1,
          status: messageData.status || "OPEN",
          ticketNumber: messageData.metadata?.ticketNumber,
          instance: selectedInstanceId,
          selectedTeamId,
          selectedAgentId,
        }

        addOrUpdateChat(chatData)

        if (messageData.text) {
          updateLastMessage(
            messageData.sender,
            messageData.text,
            messageData.timestamp,
            false
          )
        }
      } catch (error) {
        console.error("Error processing new_message:", error)
      }
    },
    [
      formatMessage,
      addMessage,
      updateLastMessage,
      addOrUpdateChat,
      selectedInstanceId,
      isMessageForCurrentInstance,
      selectedTeamId,
      selectedAgentId,
    ]
  )

  const handleAIMessage = useCallback(
    (messageData: any) => {
      try {
        // console.log("Received new_message_ai:", {
        //   messageId: messageData.id,
        //   instance: messageData.instanceName,
        //   currentInstance: selectedInstanceId,
        // })

        if (!isMessageForCurrentInstance(messageData)) {
          // console.log("AI Message skipped - wrong instance")
          return
        }

        if (!messageData.messageTo) {
          // console.log("AI Message skipped - no recipient")
          return
        }

        // const normalizedPhoneNumber = messageData.messageTo.replace(/^55/, "")

        const formattedMessage = formatMessage({
          id: messageData.id,
          text: messageData.text,
          sender: "ai",
          timestamp: messageData.timestamp,
          messageTo: messageData.messageTo,
          metadata: {
            instance: selectedInstanceId,
            agentTitle: messageData.agentTitle,
            selectedTeamId,
            selectedAgentId,
          },
          conversationId: messageData.conversationId,
        })

        // console.log("Processing AI message for instance:", {
        //   instance: selectedInstanceId,
        //   messageId: messageData.id,
        //   recipient: messageData.messageTo,
        // })

        // console.log("AI MESSAGE DATA RECEIVED: ", formattedMessage)

        addMessage(formattedMessage)

        const chatData = {
          id: messageData.conversationId || messageData.messageTo,
          name: messageData.messageTo,
          phoneNumber: messageData.messageTo,
          lastMessage: messageData.text,
          timestamp: messageData.timestamp,
          unreadCount: 0,
          status: messageData.status || "OPEN",
          ticketNumber: messageData.ticketNumber,
          instance: selectedInstanceId,
          selectedTeamId,
          selectedAgentId,
        }

        addOrUpdateChat(chatData)

        updateLastMessage(
          messageData.messageTo,
          messageData.text,
          messageData.timestamp,
          true
        )
      } catch (error) {
        console.error("Error processing new_message_ai:", error)
      }
    },
    [
      formatMessage,
      addMessage,
      updateLastMessage,
      addOrUpdateChat,
      selectedInstanceId,
      isMessageForCurrentInstance,
      selectedTeamId,
      selectedAgentId,
    ]
  )

  useEffect(() => {
    if (!selectedInstanceId || !selectedTeamId || !selectedAgentId) {
      console.error("Missing required props:", {
        selectedInstanceId,
        selectedTeamId,
        selectedAgentId,
      })
      return
    }

    socketRef.current = io(
      "https://assistent-ai-nodejs.3g77fw.easypanel.host/:3001",
      {
        transports: ["websocket"],
        query: {
          selectedInstanceId,
          selectedTeamId,
          selectedAgentId,
        },
      }
    )

    socketRef.current.on("connect", () => {
      console.log("WebSocket Connected:", {
        selectedInstanceId,
        selectedTeamId,
        selectedAgentId,
        socketId: socketRef.current?.id,
      })
      setIsConnected(true)

      // Join instance-specific room
      socketRef.current?.emit("join_instance", {
        selectedInstanceId,
        selectedTeamId,
        selectedAgentId,
      })
    })

    socketRef.current.on("disconnect", () => {
      console.log("WebSocket Disconnected")
      setIsConnected(false)
    })

    socketRef.current.on("new_message", handleNewMessage)
    socketRef.current.on("new_message_ai", handleAIMessage)

    return () => {
      console.log("Cleaning up WebSocket connection")
      if (socketRef.current) {
        socketRef.current.emit("leave_instance", {
          selectedInstanceId,
          selectedTeamId,
          selectedAgentId,
        })
        socketRef.current.disconnect()
      }
    }
  }, [
    selectedInstanceId,
    selectedTeamId,
    selectedAgentId,
    handleNewMessage,
    handleAIMessage,
  ])

  return <>{children}</>
}
