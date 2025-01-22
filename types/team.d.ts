export interface TeamWithRelations extends Team {
    agents: (Agent & {
      WhatsAppInstance: WhatsAppInstance[]
    })[]
    members: TeamMember[]
  }