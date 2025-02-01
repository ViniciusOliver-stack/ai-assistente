// app/api/webhook/route.ts
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse('Webhook error', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Atualizar o usuário com os dados da assinatura
      if (session.metadata?.userId) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

      // const stripePriceId = subscription.items.data[0].price.id;

      // // Buscar o plano correspondente ao stripePriceId
      // const plan = await db.plan.findUnique({
      //   where: { stripePriceId },
      // });

      // if (!plan) {
      //   console.error('Plano não encontrado para o stripePriceId:', stripePriceId);
      //   throw new Error('Plano não encontrado');
      // }

      await db.user.update({
          where: { id: session.metadata.userId },
          data: {
            // Criar ou atualizar customer ID aqui
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeSubscriptionStatus: subscription.status,
            trialEndDate: null,
            trialStartDate: null,
          },
        });
      }
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        await db.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeSubscriptionStatus: subscription.status,
          },
        });
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await db.user.updateMany({
        where: { stripeSubscriptionId: deletedSubscription.id },
        data: {
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeSubscriptionStatus: 'canceled',
        },
      });
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}