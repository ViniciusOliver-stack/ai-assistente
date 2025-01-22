import { create } from 'zustand';
import { Chat } from '@/types/chat';

interface ChatListStore {
  chats: Chat[];
  activeChat: string | null;
  isLoading: boolean;
  error: string | null;

  setChats: (chats: Chat[]) => void;
  addOrUpdateChat: (chatData: Partial<Chat>) => void;
  setActiveChat: (chatId: string) => void;
  updateLastMessage: (phoneNumber: string, message: string, timestamp: string, isAI?: boolean) => void;
  fetchChats: (teamId: string, instanceId: string, agentId: string) => Promise<void>;
}

export const useChatListStore = create<ChatListStore>((set) => ({
  chats: [],
  activeChat: null,
  isLoading: false,
  error: null,

  setChats: (chats) => set({ chats }),

  fetchChats: async (teamId: string, instanceId: string, agentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `/api/chats?teamId=${teamId}&instanceId=${instanceId}&agentId=${agentId}`
      );
      if (!response.ok) throw new Error('Falha ao carregar chats');
      
      const chats = await response.json();

      console.log("Chats", chats)

      const normalizedChats = chats.map((chat: Chat) => ({
        ...chat,
        phoneNumber: chat.name,
        id: chat.id // Mantém o ID original do banco de dados
      }));
      
      set({ chats: normalizedChats.sort((a: Chat, b: Chat) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ) });
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      set({ error: 'Falha ao carregar os chats' });
    } finally {
      set({ isLoading: false });
    }
  },

  addOrUpdateChat: (chatData) => {
    set((state) => {
      // Find existing chat by ID first, then by phone number
      const existingChatIndex = state.chats.findIndex(
        (chat) => 
          chat.id === chatData.id || 
          (chatData.phoneNumber && chat.phoneNumber === chatData.phoneNumber)
      );

      if (existingChatIndex > -1) {
        const updatedChats = [...state.chats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          ...chatData,
          // Preserve existing ID to prevent duplicates
          id: updatedChats[existingChatIndex].id,
          unreadCount: state.activeChat === updatedChats[existingChatIndex].id ? 
            0 : (updatedChats[existingChatIndex].unreadCount || 0)
        };
        
        return { 
          chats: updatedChats.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        };
      }

      // If no existing chat found, create new one
      const newChat: Chat = {
        id: chatData.id || Date.now().toString(),
        name: chatData.name || chatData.phoneNumber as string,
        phoneNumber: chatData.phoneNumber,
        lastMessage: chatData.lastMessage || '',
        timestamp: chatData.timestamp || new Date().toISOString(),
        unreadCount: chatData.unreadCount || 0,
        status: chatData.status || 'OPEN',
        ticketNumber: chatData.ticketNumber
      };

      return { 
        chats: [...state.chats, newChat].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      };
    });
  },

  setActiveChat: (chatId) => set({ activeChat: chatId }),

  updateLastMessage: (phoneNumber: string, message: string, timestamp: string, isAI = false) => {
    set((state) => {
      
      const chatIndex = state.chats.findIndex(
        (chat) => chat.name === phoneNumber
      );

      if (chatIndex > -1) {
        const updatedChats = [...state.chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: message,
          timestamp,
          unreadCount: state.activeChat === updatedChats[chatIndex].id ? 
            0 : updatedChats[chatIndex].unreadCount + (isAI ? 0 : 1)
        };
        console.log("updatedChats", updatedChats)

        return {
          chats: updatedChats.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        };
      }

      return state;
    });
  },
}));