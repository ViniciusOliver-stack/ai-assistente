export interface Message {
    id: string | number
    text: string
    sender: "client" | "ai" | string
    timestamp: string
  }
  