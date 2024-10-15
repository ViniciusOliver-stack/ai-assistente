export const config = {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      plans: {
        basic: {
           priceId: "price_1Q8AJoDgEDIMcktiZLmEKDB0",
           quota: {
            agents: 1,        // Limite de agentes "IA"
            knowledgeBase: 1, // Limite para o banco de conhecimento
            teams: 1,         // Limite para o número de equipes
            members: 1        // Limite de membros por equipe
          }
        },
        operational: {
            priceId: "price_1Q8AKCDgEDIMckti1uwWdTOM",
            quota: {
              agents: 2,
              knowledgeBase: 4,
              teams: 2,
              members: 4
            }
        },
        management: {
          priceId: "price_1Q8Wa7DgEDIMcktihOkWYPNh",
          quota: {
            agents: 6,
            knowledgeBase: 12,
            teams: 6,
            members: 20
          }
      },
        executive: {
            priceId: "price_1Q8AKiDgEDIMcktiUNVjqRlj",
            quota: {
              agents: 30,
              knowledgeBase: 60,
              teams: 10,
              members: 60
            }
        },

      }
    }
  }