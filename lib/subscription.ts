// lib/subscription.ts

import { db } from "./db";
import { stripe } from "./stripe";

export async function handleSubscriptionChange(userId: string, newPriceId: string) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                stripePriceId: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Verificar se já está no mesmo plano
        if (user.stripePriceId === newPriceId) {
            return { url: `${process.env.NEXTAUTH_URL}/success` };
        }

        // Atualizar apenas se já tiver uma assinatura
        if (user.stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(
                user.stripeSubscriptionId
            );

            return await stripe.subscriptions.update(user.stripeSubscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                }],
                proration_behavior: 'always_invoice',
            });
        }

        return null;
    } catch (error) {
        console.error("Error handling subscription change:", error);
        throw error;
    }
}

export const checkSubscription = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      stripeSubscriptionStatus: true,
      stripePriceId: true,
    },
  });

  if (!user) return false;

  const isSubscribed = user.stripeSubscriptionStatus === 'active';
  const isCanceled = user.stripeSubscriptionStatus === 'canceled';

  return {
    isSubscribed: !!isSubscribed,
    isCanceled,
    stripePriceId: user.stripePriceId,
  };
};