import { create } from 'zustand';
import { Chat } from '@/types/chat';

interface ChatListStore {
  chats: Chat[];
  activeChat: string | null;
  addOrUpdateChat: (chatData: Partial<Chat>) => void;
  setActiveChat: (chatId: string) => void;
  updateLastMessage: (phoneNumber: string, message: string, timestamp: string, isAI?: boolean) => void;
}

export const useChatListStore = create<ChatListStore>((set) => ({
  chats: [],
  activeChat: null,

  addOrUpdateChat: (chatData) => {
    set((state) => {
      // Não adiciona chats da IA
      if (chatData.phoneNumber === 'ai') return state;

      const existingChatIndex = state.chats.findIndex(
        (chat) => chat.phoneNumber === chatData.phoneNumber
      );

      if (existingChatIndex > -1) {
        const updatedChats = [...state.chats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          ...chatData,
        };
        return { chats: updatedChats };
      }

      const newChat: Chat = {
        id: chatData.id || Date.now().toString(),
        name: chatData.name || chatData.phoneNumber || 'Unknown',
        lastMessage: chatData.lastMessage || '',
        timestamp: chatData.timestamp || new Date().toISOString(),
        unreadCount: chatData.unreadCount || 0,
        phoneNumber: chatData.phoneNumber || '',
      };

      return { 
        chats: [...state.chats, newChat].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      };
    });
  },

  setActiveChat: (chatId) => set({ activeChat: chatId }),

  updateLastMessage: (phoneNumber, message, timestamp, isAI = false) => {
    // Ignora atualizações diretas de mensagens da IA
    if (phoneNumber === 'ai') return;

    set((state) => {
      const chatIndex = state.chats.findIndex(
        (chat) => chat.phoneNumber === phoneNumber
      );

      // Se não encontrou o chat e não é uma mensagem da IA, cria um novo
      if (chatIndex === -1 && !isAI) {
        const newChat: Chat = {
            id: Date.now().toString(),
            name: phoneNumber,
            phoneNumber,
            lastMessage: message,
            timestamp,
            unreadCount: 1,
          };
        return {
          chats: [...state.chats, newChat].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
        };
      }

      // Se encontrou o chat, atualiza apenas se for mensagem do usuário ou se for a primeira resposta da IA
      if (chatIndex > -1) {
        const updatedChats = [...state.chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: message,
          timestamp,
          // Incrementa o contador de não lidos apenas para mensagens de usuário
          unreadCount: isAI ? updatedChats[chatIndex].unreadCount : 
            state.activeChat === updatedChats[chatIndex].id ? 
              0 : updatedChats[chatIndex].unreadCount + 1,
        };

        return {
          chats: updatedChats.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ),
        };
      }

      return state;
    });
  },
}));