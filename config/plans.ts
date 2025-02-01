import { SubscriptionPlan } from "@/types/stripe";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Plano Mensal',
      description: 'Acesso a todos os recursos com cobrança mensal',
      priceId: 'price_1Qkax9DgEDIMcktiEJCV6vqO',
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
      priceId: 'price_1Qkb8GDgEDIMckti0gtjRUgf',
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
  