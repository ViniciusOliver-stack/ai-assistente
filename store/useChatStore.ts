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
  currentPage: number
  messagesPerPage: number

  aiEnabledConversations: Set<string> 

  //Ações
  setCurrentChatId: (chatId: string | null) => void
  loadMessagesForChat: (chatId: string, loadMore?: boolean) => Promise<void>
  loadMoreMessages: (chatId: string) => Promise<void>
  addMessage: (message: any) => void
  setIsAIEnabled: (enabled: boolean) => void
  setIsLoading: (loading: boolean) => void
  setNewMessage: (message: string) => void
  handleAIResponse: (clientMessageText: string, agentId: string) => Promise<void>
  sendManualMessage: (text: string, phoneNumber: string) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatMessage: (messageData: any) => Message

  toggleAIForCurrentChat: (chatId: string) => Promise<void>
  isAIEnabledForChat: (chatId: string) => boolean
  setAIEnabledForChat: (chatId: string, enabled: boolean) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isAIEnabled: true,
  aiEnabledConversations: new Set(),
  isLoading: false,
  newMessage: "",
  currentChatId: null,
  messageHistory: {},
  hasMore: true,
  loadingMore: false,
  currentPage: 1,
  messagesPerPage: 10,

  toggleAIForCurrentChat: async (chatId: string) => {
    if (!chatId) return;

   const isCurrentlyEnabled = get().isAIEnabledForChat(chatId);
  const newState = !isCurrentlyEnabled;

    try {
      // Atualizar no backend
      const response = await fetch(`/api/conversations/${chatId}/ai-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAIEnabled: newState })
      });

      if (!response.ok) throw new Error('Failed to update AI status');

      // Atualizar estado local
      set((state) => {
        const newAiEnabledConversations = new Set(state.aiEnabledConversations);
        if (newState) {
          newAiEnabledConversations.add(chatId);
        } else {
          newAiEnabledConversations.delete(chatId);
        }
        return { aiEnabledConversations: newAiEnabledConversations };
      });
    } catch (error) {
      console.error('Error toggling AI status:', error);
    }
  },

  isAIEnabledForChat: (chatId: string) => {
    return get().aiEnabledConversations.has(chatId);
  },

  setAIEnabledForChat: (chatId: string, enabled: boolean) => {
    set((state) => {
      const newAiEnabledConversations = new Set(state.aiEnabledConversations);
      if (enabled) {
        newAiEnabledConversations.add(chatId);
      } else {
        newAiEnabledConversations.delete(chatId);
      }
      return { aiEnabledConversations: newAiEnabledConversations };
    });
  },
  
  formatMessage: (messageData) => {
    return {
      id: messageData.id || Date.now().toString(),
      text: messageData.text,
      sender: messageData.sender,
      timestamp: messageData.timestamp || new Date().toISOString(),
      messageTo: messageData.messageTo || null, // Adiciona o destinatário da mensagem
      metadata: messageData.metadata || null,
      conversationId: messageData.conversationId || null,
    }
  },
  
  setCurrentChatId: (chatId) => {
    set({ currentChatId: chatId, messages: [] })
    if (chatId) {
      get().loadMessagesForChat(chatId)
    }
  },

  loadMessagesForChat: async (chatId, loadMore = false) => {
    if (!chatId) return;
    
    const { currentPage, messagesPerPage } = get()
    const page = loadMore ? currentPage + 1 : 1
    
    set({ isLoading: true });
    try {
      const response = await fetch(
        `/api/chats/${chatId}/messages?page=${page}&limit=${messagesPerPage}`
      );
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      const formattedMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        messageTo: msg.recipientId,
        metadata: msg.metadata,
        conversationId: msg.conversationId || chatId
      }));

      console.log('Formatted Messages:', formattedMessages);
      
      set((state) => ({
        messages: loadMore ? [...formattedMessages, ...state.messages] : formattedMessages,
        hasMore: data.hasMore,
        currentPage: page,
        messageHistory: {
          ...state.messageHistory,
          [chatId]: loadMore 
            ? [...formattedMessages, ...(state.messageHistory[chatId] || [])]
            : formattedMessages
        }
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadMoreMessages: async (chatId) => {
    if (get().loadingMore || !get().hasMore) return;
    
    set({ loadingMore: true });
    await get().loadMessagesForChat(chatId, true);
    set({ loadingMore: false });
  },

  addMessage: (message) => {
    set((state) => {
      // Only add message if it belongs to the current conversation
      if (state.currentChatId && message.conversationId !== state.currentChatId) {
        return state
      }

      const newMessages = [...state.messages, message]
      
      // Update message history for the specific chat
      const chatId = message.conversationId || 
        (message.sender === 'ai' ? message.messageTo : message.sender)
      
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
          agentId,
          conversationId: get().currentChatId 
        }),
      })

      const data = await response.json()
      const aiMessage = get().formatMessage({
        id: data.id,
        text: data.text,
        sender: "ai",
        timestamp: data.timestamp,
        messageTo: data.messageTo, // Adiciona o destinatário
        metadata: data.metadata,
        conversationId: get().currentChatId,
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
        conversationId: get().currentChatId,
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
            conversationId: get().currentChatId,
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