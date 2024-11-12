import { create } from 'zustand'

interface Message {
  id: number
  text: string
  sender: "client" | "ai"
}

interface ChatStore {
  messages: Message[]
  isAIEnabled: boolean
  isLoading: boolean
  newMessage: string
  addMessage: (message: Message) => void
  setIsAIEnabled: (enabled: boolean) => void
  setIsLoading: (loading: boolean) => void
  setNewMessage: (message: string) => void
  handleAIResponse: (clientMessageText: string, agentId: string) => Promise<void>
  sendManualMessage: (text: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isAIEnabled: true,
  isLoading: false,
  newMessage: "",
  
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  
  setIsAIEnabled: (enabled) => 
    set({ isAIEnabled: enabled }),
  
  setIsLoading: (loading) => 
    set({ isLoading: loading }),
    
  setNewMessage: (message) =>
    set({ newMessage: message }),

  handleAIResponse: async (clientMessageText, agentId) => {
    try {
      // Gera resposta da IA
      const response = await fetch("/api/send-ai-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientMessageText, agentId: "cm326wkzr0001ph44fr0uqiqa" }),
      })

      const data = await response.json()
      const aiMessage: Message = {
        id: get().messages.length + 2,
        text: data.text,
        sender: data.sender,
      }
      // Adiciona mensagem ao estado
      get().addMessage(aiMessage)

      // Envia resposta via API externa
      // await fetch(
      //   "https://symplus-evolution.3g77fw.easypanel.host/message/sendText/SymplusTalk",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       apikey: "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ",
      //     },
      //     body: JSON.stringify({
      //       number: "5577988633518",
      //       options: {
      //         delay: 1200,
      //         presence: "composing",
      //         linkPreview: true,
      //       },
      //       textMessage: {
      //         text: aiMessage.text,
      //       },
      //     }),
      //   }
      // )
    } catch (error) {
      console.error("Erro ao processar a resposta da IA:", error)
    }
  },

  sendManualMessage: async (text: string) => {
    if (!text.trim()) return
    
    set({ isLoading: true })
    
    try {
      const message: Message = {
        id: get().messages.length + 1,
        text,
        sender: "ai",
      }

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
            number: "5577988633518",
            options: {
              delay: 1200,
              presence: "composing",
              linkPreview: true,
            },
            textMessage: {
              text,
            },
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