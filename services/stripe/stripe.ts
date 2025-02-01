import { db } from "@/lib/db";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function createStripeCustomer({email, name}: {email: string, name: string}) {
    const customer = await stripe.customers.create({
        email,
        name,
    })

    await db.user.update({
        where: {email},
        data: {
            stripeCustomerId: customer.id,
            trialStartDate: new Date(),
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          },
    })

    return customer
}

export async function createSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{price: priceId}],
        trial_period_days: 7,
        trial_settings: {
            end_behavior: {
                missing_payment_method: 'cancel',
            }
        }
    })

    return subscription
}