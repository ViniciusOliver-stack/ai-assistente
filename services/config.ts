export const config = {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      plans: {
        basic: {
           priceId: "price_1Q8AJoDgEDIMcktiZLmEKDB0",
           quota: {
            agents: 12,        // Limite de agentes "IA"
            knowledgeBase: 4, // Limite para o banco de conhecimento
            teams: 5,         // Limite para o número de equipes
            members: 5        // Limite de membros por equipe
          }
        },
      }
    }
  }