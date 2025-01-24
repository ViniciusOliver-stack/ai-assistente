export interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    phoneNumber?: string;
    ticketNumber?: string;
    status?: string;
  }

  export interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: string;
    messageTo: string | null;
    metadata?: {
      model?: string;
      agentTitle?: string;
      instanceName?: string;
      instance?: string;
      isAIResponse?: boolean;
    };
  }
  