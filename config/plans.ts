import { SubscriptionPlan } from "@/types/stripe";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Plano Mensal',
      description: 'Acesso a todos os recursos com cobrança mensal',
      // priceId: 'price_1Qkax9DgEDIMcktiEJCV6vqO',
      priceId: 'price_1QnmyvDgEDIMckti7MPC62lw',
      price: 49.90,
      interval: 'month',
      limits: {
        agents: 1,
        knowledgeBase: 1,
        teams: 1,
        members: 1
      }
    },
    {
      id: 'yearly',
      name: 'Plano Anual',
      description: 'Economize 20% com cobrança anual',
      // priceId: 'price_1Qkb8GDgEDIMckti0gtjRUgf',
      priceId: 'price_1QnnVUDgEDIMckti9pOZC5bh',
      price: 499.00,
      interval: 'year',
      limits: {
        agents: 1,
        knowledgeBase: 1,
        teams: 1,
        members: 1
      }
    }
  ];
  