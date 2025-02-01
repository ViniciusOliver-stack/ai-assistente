export interface PlanLimit {
    agents: number;
    knowledgeBase: number;
    teams: number;
    members: number;
  }
  
  export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    priceId: string;
    price: number;
    interval: 'month' | 'year';
    limits: PlanLimit;
  }