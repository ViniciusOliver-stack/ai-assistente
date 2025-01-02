export interface PromptTemplate {
    id: string
    name: string
    template: {
      whoIsAgent: string
      whatAgentDoes: string
      agentObjective: string
      agentResponseStyle: string
      customRules: string
    }
  }