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
      // Normaliza os números de telefone removendo qualquer prefixo "55"
      const normalizedChats = chats.map((chat: Chat) => ({
        ...chat,
        phoneNumber: chat.name.replace(/^55/, ''),
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
      console.log("chatData", chatData)
      // Normaliza o número de telefone removendo o prefixo "55" se existir
      const normalizedPhoneNumber = chatData.phoneNumber?.replace(/^55/, '');
      
      if (!normalizedPhoneNumber) return state;

      const existingChatIndex = state.chats.findIndex(
        (chat) => chat.name.replace(/^55/, '') === normalizedPhoneNumber
      );

      if (existingChatIndex > -1) {
        const updatedChats = [...state.chats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex], // Mantém os dados existentes
          lastMessage: chatData.lastMessage || updatedChats[existingChatIndex].lastMessage,
          timestamp: chatData.timestamp || updatedChats[existingChatIndex].timestamp,
          unreadCount: state.activeChat === updatedChats[existingChatIndex].id ? 
            0 : (updatedChats[existingChatIndex].unreadCount || 0) + 1
        };
        
        return { 
          chats: updatedChats.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        };
      }

      // Se chegou aqui, é um chat realmente novo
      const newChat: Chat = {
        id: chatData.id || normalizedPhoneNumber,
        name: chatData.name || normalizedPhoneNumber,
        phoneNumber: normalizedPhoneNumber,
        lastMessage: chatData.lastMessage || '',
        timestamp: chatData.timestamp || new Date().toISOString(),
        unreadCount: chatData.unreadCount || 1,
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
      // Normaliza o número de telefone para a comparação
      const normalizedPhoneNumber = phoneNumber.replace(/^55/, '');
      
      const chatIndex = state.chats.findIndex(
        (chat) => chat.name.replace(/^55/, '') === normalizedPhoneNumber
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