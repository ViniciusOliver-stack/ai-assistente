import { create } from 'zustand'
import { Message } from '@/types/message'

interface ChatStore {
  messages: Message[]
  isAIEnabled: boolean
  isLoading: boolean
  newMessage: string
  currentChatId: string | null
  messageHistory: Record<string, Message[]>
  setCurrentChatId: (chatId: string | null) => void
  loadMessagesForChat: (chatId: string) => void
  addMessage: (message: Message) => void
  setIsAIEnabled: (enabled: boolean) => void
  setIsLoading: (loading: boolean) => void
  setNewMessage: (message: string) => void
  handleAIResponse: (clientMessageText: string, agentId: string) => Promise<void>
  sendManualMessage: (text: string, phoneNumber: string) => Promise<void>
  formatMessage: (messageData: any) => Message
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isAIEnabled: true,
  isLoading: false,
  newMessage: "",
  currentChatId: null,
  messageHistory: {},
  
  formatMessage: (messageData) => {
    return {
      id: messageData.id || Date.now(),
      text: messageData.text,
      sender: messageData.sender === "client" ? "client" : messageData.sender,
      timestamp: messageData.timestamp || new Date().toISOString(),
      phoneNumber: messageData.phoneNumber || null,
    }
  },
  
  setCurrentChatId: (chatId) => {
    set({ currentChatId: chatId })
    if (chatId) {
      get().loadMessagesForChat(chatId)
    }
  },

  loadMessagesForChat: async (chatId) => {
    set({ isLoading: true })
    try {
      // Primeiro verifica se já temos as mensagens em cache
      const cachedMessages = get().messageHistory[chatId]
      if (cachedMessages) {
        set({ messages: cachedMessages })
        return
      }

      // Se não tiver em cache, carrega do backend
      const response = await fetch(`/api/messages/${chatId}`)
      const messages = await response.json()
      
      // Atualiza tanto o cache quanto as mensagens atuais
      set((state) => ({
        messages,
        messageHistory: {
          ...state.messageHistory,
          [chatId]: messages
        }
      }))
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addMessage: (message, chatId = null) => {
    const targetChatId = chatId || get().currentChatId
    if (!targetChatId) return

    set((state) => {
      // Atualiza tanto as mensagens atuais quanto o histórico
      const updatedMessages = [...(state.messages || []), message].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      return {
        messages: updatedMessages,
        messageHistory: {
          ...state.messageHistory,
          [targetChatId]: updatedMessages
        }
      }
    })
  },
  
  setIsAIEnabled: (enabled) => set({ isAIEnabled: enabled }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setNewMessage: (message) => set({ newMessage: message }),

  handleAIResponse: async (clientMessageText, agentId) => {
    try {
      set({ isLoading: true })
      const response = await fetch("/api/send-ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          clientMessageText, 
          agentId: "cm326wkzr0001ph44fr0uqiqa" 
        }),
      })

      const data = await response.json()
      const aiMessage = get().formatMessage({
        id: data.id,
        text: data.text,
        sender: "ai",
        timestamp: data.timestamp
      })
      
      get().addMessage(aiMessage)
    } catch (error) {
      console.error("Erro ao processar a resposta da IA:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  sendManualMessage: async (text: string, phoneNumber: string) => {
    if (!text.trim() || !phoneNumber) return
    
    set({ isLoading: true })
    
    try {
      const message = get().formatMessage({
        id: Date.now(),
        text,
        sender: "ai",
        timestamp: new Date().toISOString()
      })

      get().addMessage(message)
      
      await fetch(
        "https://symplus-evolution.3g77fw.easypanel.host/message/sendText/SymplusTalk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
          },
          body: JSON.stringify({
            number: phoneNumber,
            options: {
              delay: 1200,
              presence: "composing",
              linkPreview: true,
            },
            textMessage: { text },
          }),
        }
      )
      
      set({ newMessage: "" })
    } catch (error) {
      console.error("Erro ao enviar mensagem manual:", error)
    } finally {
      set({ isLoading: false })
    }
  },
}))
