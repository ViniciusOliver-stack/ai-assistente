/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message } from '@/types/chat'
import { create } from 'zustand'

interface ChatStore {
  messages: Message[]
  isAIEnabled: boolean
  isLoading: boolean
  newMessage: string
  currentChatId: string | null
  messageHistory: Record<string, Message[]>
  hasMore: boolean
  loadingMore: boolean

  //Ações
  setCurrentChatId: (chatId: string | null) => void
  loadMessagesForChat: (chatId: string, loadMore?: boolean) => Promise<void>
  addMessage: (message: Message) => void
  setIsAIEnabled: (enabled: boolean) => void
  setIsLoading: (loading: boolean) => void
  setNewMessage: (message: string) => void
  handleAIResponse: (clientMessageText: string, agentId: string) => Promise<void>
  sendManualMessage: (text: string, phoneNumber: string) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatMessage: (messageData: any) => Message
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isAIEnabled: true,
  isLoading: false,
  newMessage: "",
  currentChatId: null,
  messageHistory: {},
  hasMore: true,
  loadingMore: false,
  
  formatMessage: (messageData) => {
    return {
      id: messageData.id || Date.now().toString(),
      text: messageData.text,
      sender: messageData.sender,
      timestamp: messageData.timestamp || new Date().toISOString(),
      messageTo: messageData.messageTo || null, // Adiciona o destinatário da mensagem
      metadata: messageData.metadata || null
    }
  },
  
  setCurrentChatId: (chatId) => {
    set({ currentChatId: chatId, messages: [] })
    if (chatId) {
      get().loadMessagesForChat(chatId)
    }
  },

  loadMessagesForChat: async (chatId) => {
    if (!chatId) return;
    
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error('Falha ao carregar mensagens');
      
      const messagesData = await response.json();
      
      // Formata as mensagens recebidas garantindo que o conversationId está presente
      const formattedMessages = messagesData.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        messageTo: msg.recipientId,
        metadata: msg.metadata,
        conversationId: msg.conversationId || chatId // Usa o chatId como fallback
      }));
      
      set((state) => ({
        messages: formattedMessages,
        messageHistory: {
          ...state.messageHistory,
          [chatId]: formattedMessages
        }
      }));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: (message) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      
      // Atualiza também o histórico de mensagens do chat específico
      const chatId = message.sender === 'ai' ? message.messageTo : message.sender;
      if (chatId) {
        const chatMessages = state.messageHistory[chatId] || []
        return {
          messages: newMessages,
          messageHistory: {
            ...state.messageHistory,
            [chatId]: [...chatMessages, message]
          }
        }
      }
      
      return { messages: newMessages }
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
        messageTo: data.messageTo, // Adiciona o destinatário
        metadata: data.metadata
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
      })

      get().addMessage(message)
      
      await fetch(
        "https://evolution.rubnik.com/message/sendText/Rubnik",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "qbTMAT9bS7VZAXB2WWIL7NW9gL3hY7fn",
          },
          body: JSON.stringify({
            number: phoneNumber,
            delay: 1200,
            linkPreview: true,
            text,
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