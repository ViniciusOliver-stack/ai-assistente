import Stripe from "stripe"

import { config } from "../config"
import { db } from "@/lib/db"

console.log(process.env.STRIPE_SECRET_KEY)

export const stripe = new Stripe(config.stripe.secretKey || "", {
  apiVersion: '2024-09-30.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email })
  return customers.data[0]
}

export const createStripeCustomer = async (
  input: {
    name?: string,
    email: string
  }
) => {
  const customer = await getStripeCustomerByEmail(input.email)
  if(customer) return customer
  
  const createdCustomer = await stripe.customers.create({
    email: input.email,
    name: input.name
  })

  const createdCustomerSubscription = await stripe.subscriptions.create({
    customer: createdCustomer.id,
    items: [{ price: config.stripe.plans.basic.priceId }],
  })

  await db.user.update({
    where: {
      email: input.email,
    },
    data: {
      stripeCustomerId: createdCustomer.id,
      stripeSubscriptionId: createdCustomerSubscription.id,
      stripeSubscriptionStatus: createdCustomerSubscription.status,
      stripePriceId: config.stripe.plans.basic.priceId
    }
  })

  return createdCustomer
}

export const createCheckoutSession = async (
  userId: string,
  userEmail: string,
  priceId: string
) => {
  try {
    const customer = await createStripeCustomer({
      email: userEmail,
    })


    const user = await db.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    
    const userStripeSubscriptionId = user?.stripeSubscriptionId;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const subscription = await stripe.subscriptionItems.list({
      subscription: userStripeSubscriptionId as string,
      limit: 1,
    })


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: priceId, // Usar o priceId do plano selecionado
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/config/billing?success=true`,
      cancel_url: `http://localhost:3000/config/billing?success=false`,
    })

    return {
      url: session.url,
    }
  } catch (error) {
    console.error(error)
    throw new Error('Error to create checkout session')
  }
}

export const handleProcessWebhookCheckout = async (event: { object: Stripe.Checkout.Session }) => {
  const clientReferenceId = event.object.client_reference_id as string
  const stripeSubscriptionId = event.object.subscription as string
  const stripeCustomerId = event.object.customer as string
  const checkoutStatus = event.object.status

  if(checkoutStatus !== 'complete') return

  if(!clientReferenceId || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error('clientReferenceId, stripeSubscriptionId and stripeCustomerId is required')
  }

  const userExists = await db.user.findUnique({
    where: {
      id: clientReferenceId
    },
    select: {
      id: true
    }
  })

  if(!userExists) {
    throw new Error('user of clientReferenceId not found')
  }

  await db.user.update({
    where: {
      id: userExists.id
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
    }
  })
}

export const handleProcessWebhookUpdatedSubscription = async (event: { object: Stripe.Subscription }) => {
  const stripeCustomerId = event.object.customer as string
  const stripeSubscriptionId = event.object.id as string
  const stripeSubscriptionStatus = event.object.status
  const stripePriceId = event.object.items.data[0].price.id


  const userExists = await db.user.findFirst({
    where: {
      OR: [
        {
          stripeSubscriptionId,
        },
        {
          stripeCustomerId
        }
      ]
    },
    select: {
      id: true
    }
  })

  if(!userExists) {
    throw new Error('user of stripeCustomerId not found')
  }

  await db.user.update({
    where: {
      id: userExists.id
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus,
      stripePriceId,
    }
  })
}

type Plan = {
  priceId: string
  quota: {
    agents: number,
    knowledgeBase: number,
    teams: number,
    members: number
  }
}

type Plans = {
  [key: string]: Plan
}

export const getPlanByPrice = (priceId: string) => {
  const plans: Plans = config.stripe.plans

  const planKey = Object.keys(plans).find(
    (key) => plans[key].priceId === priceId,
  ) as keyof Plans | undefined

  const plan = planKey ? plans[planKey] : null

  if (!plan) {
    throw new Error(`Plan not found for priceId: ${priceId}`)
  }

  return {
    name: planKey,
    quota: plan.quota,
  }
}