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
      id: messageData.id || Date.now().toString(),
      text: messageData.text,
      sender: messageData.sender,
      timestamp: messageData.timestamp || new Date().toISOString(),
      messageTo: messageData.messageTo || null, // Adiciona o destinatário da mensagem
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
      const cachedMessages = get().messageHistory[chatId]
      if (cachedMessages) {
        set({ messages: cachedMessages })
        return
      }

      // Se não tiver em cache, carrega do backend
      const response = await fetch(`/api/messages/${chatId}`)
      const messages = await response.json()
      
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

  addMessage: (message) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      
      // Atualiza também o histórico de mensagens do chat específico
      const chatId = message.sender === 'ai' ? message.messageTo : message.sender;
      if (chatId) {
        const chatMessages = state.messageHistory[chatId] || [];
        state.messageHistory[chatId] = [...chatMessages, message];
      }
      
      return {
        messages: newMessages,
        messageHistory: state.messageHistory
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
          agentId
        }),
      })

      const data = await response.json()
      const aiMessage = get().formatMessage({
        id: data.id,
        text: data.text,
        sender: "ai",
        timestamp: data.timestamp,
        messageTo: data.messageTo // Adiciona o destinatário
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
        id: Date.now().toString(),
        text,
        sender: "ai",
        timestamp: new Date().toISOString(),
        messageTo: phoneNumber // Adiciona o destinatário
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